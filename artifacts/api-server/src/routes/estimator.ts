import { Router, type IRouter, type Request, type Response } from "express";
import { eq } from "drizzle-orm";
import { getAuth, clerkClient } from "@clerk/express";
import { db, estimatorConfigTable } from "@workspace/db";
import {
  GetEstimatorConfigResponse,
  GetAdminEstimatorConfigResponse,
  SaveAdminEstimatorConfigBody,
  SaveAdminEstimatorConfigResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const services = [
  ["maintenance-punch-list", "Maintenance / Punch List"], ["property-cleanup", "Property Cleanup"],
  ["hauling-cleanout", "Hauling / Cleanout"], ["outdoor-curb-appeal", "Outdoor / Curb Appeal"],
  ["installation", "Installation"], ["fixtures", "Fixtures"], ["drywall-trim-caulking", "Drywall / Trim / Caulking"],
  ["fence-deck", "Fence / Deck"], ["flooring", "Flooring"], ["mailbox", "Mailbox"], ["gutters", "Gutters"],
  ["pressure-washing", "Pressure Washing"], ["yard-tree-cleanup", "Yard / Tree Cleanup"],
  ["realtor-property-punch-list", "Realtor / Property Punch List"], ["inspection-repairs", "Inspection Repairs"],
  ["other", "Other / Not Listed"],
] as const;
const option = (id: string, label: string) => ({ id, label, priceAdjustment: null });
const choice = (id: string, title: string, options: { id: string; label: string }[], required = true, helper = "") => ({
  id, type: "multiple_choice" as const, title, helper, placeholder: "", required, enabled: true,
  options: options.map((item) => option(item.id, item.label)), condition: null, pricingRule: { perUnitAdjustment: null },
});
const defaultConfig = () => ({
  version: 2,
  services: services.map(([id, label]) => ({ id, label, basePrice: null })),
  questions: [
    choice("project-type", "Project Type (Optional)", services.map(([id, label]) => ({ id, label })), false, "Choose the closest option if one fits. You can also skip this question or select Other / Not Listed."),
    { id: "project-description", type: "paragraph" as const, title: "Describe Your Project", helper: "The more details you provide, the better we can understand your project and prepare an accurate estimate.\n\nHelpful details may include:\n• What needs to be done\n• Approximate dimensions or size\n• Current condition\n• Location of the work on the property\n• Materials involved\n• What you want changed, repaired, installed, removed, or cleaned\n• Any other details you think would be helpful", placeholder: "Describe what you need, where the work is located, and the result you would like.", required: true, enabled: true, options: [], condition: null, pricingRule: { perUnitAdjustment: null } },
    { id: "approximate-size", type: "short_answer" as const, title: "Approximate Size / Dimensions (Optional)", helper: "Share measurements or an approximate size if they are relevant or known.", placeholder: "For example: 12 ft × 16 ft, three rooms, or about 200 sq ft", required: false, enabled: true, options: [], condition: null, pricingRule: { perUnitAdjustment: null } },
    { id: "current-condition", type: "paragraph" as const, title: "Current Condition (Optional)", helper: "Describe the current condition, damage, wear, or anything else we should know.", placeholder: "What does the area or item look like now?", required: false, enabled: true, options: [], condition: null, pricingRule: { perUnitAdjustment: null } },
    { id: "materials-specifications", type: "paragraph" as const, title: "Preferred Materials, Products, or Specifications (Optional)", helper: "If you already have materials or preferences, share them here. It is fine to leave this blank.", placeholder: "Product names, materials, colors, finishes, or other preferences", required: false, enabled: true, options: [], condition: null, pricingRule: { perUnitAdjustment: null } },
    { id: "additional-information", type: "paragraph" as const, title: "Additional Information (Optional)", helper: "Add any timing, access, removal, cleanup, or other details that may help us review the project.", placeholder: "Anything else you would like us to know", required: false, enabled: true, options: [], condition: null, pricingRule: { perUnitAdjustment: null } },
  ],
  pricing: { minimumProjectPrice: null, lowRangePercent: 10, highRangePercent: 20 },
});

async function loadConfig() {
  const [row] = await db.select().from(estimatorConfigTable).where(eq(estimatorConfigTable.id, 1));
  if (row) {
    const config = row.config as ReturnType<typeof defaultConfig>;
    if ((config.version ?? 0) >= 2) {
      const questions = config.questions.filter((question) => (question as { type: string }).type !== "photo_upload");
      if (questions.length !== config.questions.length) {
        const updated = { ...config, questions };
        await db.update(estimatorConfigTable).set({ config: updated, updatedAt: new Date() }).where(eq(estimatorConfigTable.id, 1));
        return updated;
      }
      return config;
    }
    const updated = defaultConfig();
    await db.update(estimatorConfigTable).set({ config: updated, updatedAt: new Date() }).where(eq(estimatorConfigTable.id, 1));
    return updated;
  }
  const config = defaultConfig();
  await db.insert(estimatorConfigTable).values({ id: 1, config });
  return config;
}

async function requireAdmin(req: Request, res: Response) {
  const auth = getAuth(req);
  const userId = "userId" in auth ? auth.userId : null;
  if (!userId) { res.status(401).json({ error: "Sign-in required." }); return false; }
  const allowed = (process.env.ADMIN_EMAILS ?? "").split(",").map((email) => email.trim().toLowerCase()).filter(Boolean);
  if (!allowed.length) { res.status(403).json({ error: "No administrator is configured." }); return false; }
  const user = await clerkClient.users.getUser(userId);
  const emails = user.emailAddresses
    .filter((item) => item.verification?.status === "verified")
    .map((item) => item.emailAddress.toLowerCase());
  if (!emails.some((email) => allowed.includes(email))) { res.status(403).json({ error: "Administrator access required." }); return false; }
  return true;
}

router.get("/estimator-config", async (_req, res): Promise<void> => {
  const parsed = GetEstimatorConfigResponse.parse(await loadConfig());
  res.json(parsed);
});
router.get("/admin/estimator-config", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  res.json(GetAdminEstimatorConfigResponse.parse(await loadConfig()));
});
router.put("/admin/estimator-config", async (req, res): Promise<void> => {
  if (!(await requireAdmin(req, res))) return;
  const parsed = SaveAdminEstimatorConfigBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const config = { ...parsed.data, questions: parsed.data.questions.filter((question) => question.type !== "photo_upload") };
  const [saved] = await db.insert(estimatorConfigTable).values({ id: 1, config, updatedAt: new Date() }).onConflictDoUpdate({ target: estimatorConfigTable.id, set: { config, updatedAt: new Date() } }).returning();
  res.json(SaveAdminEstimatorConfigResponse.parse(saved.config));
});
export default router;