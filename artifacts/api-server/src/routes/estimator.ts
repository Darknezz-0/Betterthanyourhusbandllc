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
  ["installations", "Installations"], ["fixtures", "Fixtures"], ["drywall-trim-caulk", "Drywall, Trim & Caulking"],
  ["fence-deck-work", "Fence & Deck Work"], ["flooring", "Flooring"], ["mailbox-installation", "Mailbox Installation"],
  ["gutter-cleaning", "Gutter Cleaning"], ["pressure-washing", "Pressure Washing"], ["yard-tree-cleanup", "Yard & Tree Cleanup"],
  ["property-cleanouts", "Property Cleanouts"], ["hauling", "Hauling"], ["outdoor-living-curb-appeal", "Outdoor Living & Curb Appeal"],
  ["realtor-punch-list", "Realtor Punch List"], ["inspection-repairs", "Inspection Repairs"],
  ["egress-related-work", "Egress-Related Work"], ["custom-projects", "Custom Projects"], ["general-maintenance-punch-list", "General Maintenance & Punch List"],
] as const;
const option = (id: string, label: string) => ({ id, label, priceAdjustment: null });
const choice = (id: string, title: string, options: { id: string; label: string }[], required = true, helper = "") => ({
  id, type: "multiple_choice" as const, title, helper, placeholder: "", required, enabled: true,
  options: options.map((item) => option(item.id, item.label)), condition: null, pricingRule: { perUnitAdjustment: null },
});
const defaultConfig = () => ({
  version: 1,
  services: services.map(([id, label]) => ({ id, label, basePrice: null })),
  questions: [
    choice("project-type", "What type of project are you looking to have done?", services.map(([id, label]) => ({ id, label }))),
    { id: "project-details", type: "paragraph" as const, title: "Tell us a little about the project.", helper: "A few details help us understand what you have in mind.", placeholder: "Tell us about the project, property, and desired result.", required: false, enabled: true, options: [], condition: null, pricingRule: { perUnitAdjustment: null } },
    choice("project-size", "How large is the project?", [{ id: "small", label: "Small" }, { id: "medium", label: "Medium" }, { id: "large", label: "Large" }, { id: "not-sure", label: "Not sure" }]),
    { id: "quantity", type: "number" as const, title: "How many items, fixtures, or areas are involved?", helper: "", placeholder: "Enter a number, if known", required: false, enabled: true, options: [], condition: null, pricingRule: { perUnitAdjustment: null } },
    { id: "needs-removal", type: "yes_no" as const, title: "Are there existing fixtures, materials, or items that need to be removed before the work can be completed?", helper: "", placeholder: "", required: true, enabled: true, options: [], condition: null, pricingRule: { perUnitAdjustment: null } },
    { id: "removal-count", type: "number" as const, title: "How many need to be removed?", helper: "", placeholder: "Enter a number", required: true, enabled: true, options: [], condition: { questionId: "needs-removal", value: "yes" }, pricingRule: { perUnitAdjustment: null } },
    choice("access", "How easy is the work area to access?", [{ id: "easy", label: "Easy access / open space" }, { id: "normal", label: "Normal access" }, { id: "somewhat-difficult", label: "Somewhat difficult to access" }, { id: "second-story", label: "Second story" }, { id: "tight", label: "Tight or confined space" }, { id: "difficult", label: "Difficult to reach" }, { id: "not-sure", label: "Not sure" }]),
    choice("difficulty", "How would you describe the overall difficulty of the project?", [{ id: "simple", label: "Simple" }, { id: "moderate", label: "Moderate" }, { id: "difficult", label: "Difficult" }, { id: "not-sure", label: "Not sure" }], true, "Think about the project as a whole, including the amount of work, access, removal, installation, preparation, and anything else that may make the job more difficult."),
    { id: "additional-services", type: "checkboxes" as const, title: "Are there any additional services you may need?", helper: "Select all that apply.", placeholder: "", required: false, enabled: true, options: ["Materials pickup", "Debris removal", "Light cleanup", "Help selecting materials"].map((label, i) => option(`additional-${i}`, label)), condition: null, pricingRule: { perUnitAdjustment: null } },
    { id: "other-information", type: "paragraph" as const, title: "Do you have any other information we should know?", helper: "", placeholder: "Anything else that could help us understand the project.", required: false, enabled: true, options: [], condition: null, pricingRule: { perUnitAdjustment: null } },
    { id: "project-photos", type: "photo_upload" as const, title: "Project photos", helper: "Optional. Photos can help us understand the work area.", placeholder: "", required: false, enabled: true, options: [], condition: null, pricingRule: { perUnitAdjustment: null } },
    { id: "location", type: "short_answer" as const, title: "Where will the work be performed?", helper: "City or area is enough for this estimate.", placeholder: "City or area", required: true, enabled: true, options: [], condition: null, pricingRule: { perUnitAdjustment: null } },
  ],
  pricing: { minimumProjectPrice: null, lowRangePercent: 10, highRangePercent: 20 },
});

async function loadConfig() {
  const [row] = await db.select().from(estimatorConfigTable).where(eq(estimatorConfigTable.id, 1));
  if (row) return row.config;
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
  const [saved] = await db.insert(estimatorConfigTable).values({ id: 1, config: parsed.data, updatedAt: new Date() }).onConflictDoUpdate({ target: estimatorConfigTable.id, set: { config: parsed.data, updatedAt: new Date() } }).returning();
  res.json(SaveAdminEstimatorConfigResponse.parse(saved.config));
});
export default router;