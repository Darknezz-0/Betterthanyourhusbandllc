import { Router, type IRouter } from "express";
import { SubmitReviewBody, SubmitReviewResponse } from "@workspace/api-zod";

const router: IRouter = Router();
const recipient = "BetterThanYourHusbandLLC@gmail.com";
const windowMs = 15 * 60 * 1000;
const maxAttempts = 5;
const attempts = new Map<string, number[]>();

router.post("/reviews", async (req, res): Promise<void> => {
  const parsed = SubmitReviewBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Please enter your name, a 1–5 star rating, and a review of 15–2000 characters." });
    return;
  }

  const name = parsed.data.name.trim();
  const review = parsed.data.review.trim();
  const email = parsed.data.email?.trim();
  if (name.length < 2 || review.length < 15 || !/\p{L}/u.test(name) || !/\p{L}/u.test(review)) {
    res.status(400).json({ error: "Please enter a valid name and a review of at least 15 characters." });
    return;
  }

  const key = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  if (!key || !fromEmail || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(fromEmail)) {
    req.log.warn("Review email is not configured");
    res.status(503).json({ error: "Review submission is temporarily unavailable. Please try again later." });
    return;
  }

  const now = Date.now();
  for (const [ip, timestamps] of attempts) {
    const recent = timestamps.filter((timestamp) => now - timestamp < windowMs);
    if (recent.length) attempts.set(ip, recent);
    else attempts.delete(ip);
  }
  const ip = req.ip ?? "unknown";
  const recent = attempts.get(ip) ?? [];
  if (recent.length >= maxAttempts) {
    res.status(429).json({ error: "Too many review submissions. Please try again later." });
    return;
  }
  attempts.set(ip, [...recent, now]);

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Better Than Your Husband Reviews <${fromEmail}>`,
        to: [recipient],
        subject: "NEW CUSTOMER REVIEW SUBMISSION",
        text: [
          "NEW CUSTOMER REVIEW SUBMISSION",
          "",
          `Customer name: ${name}`,
          `Star rating: ${parsed.data.rating} out of 5`,
          `Review/comment: ${review}`,
          ...(email ? [`Customer email: ${email}`] : []),
          `Submission date/time: ${new Date(now).toISOString()} (UTC)`,
          "",
          "For manual review only. This review has not been published on the website.",
        ].join("\n"),
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      let providerReason = "unknown";
      try {
        const detail: unknown = await response.json();
        if (detail && typeof detail === "object" && "message" in detail && typeof detail.message === "string") {
          const message = detail.message.toLowerCase();
          if (/test.*email|test.*domain|onboarding@resend\.dev|own email address/.test(message)) providerReason = "test_sender_recipient_restriction";
          else if (/domain.*verif|verif.*domain/.test(message)) providerReason = "sender_domain_not_verified";
          else if (/api.key|permission|access/.test(message)) providerReason = "api_key_permission";
          else if (/rate.limit/.test(message)) providerReason = "provider_rate_limit";
          else providerReason = "other_provider_rejection";
        }
      } catch {
        // Provider error body may not be JSON. Do not log the raw body or review contents.
      }
      req.log.error({ status: response.status, providerReason }, "Resend rejected review email");
      res.status(502).json({ error: "Your review could not be submitted. Please try again." });
      return;
    }

    const result: unknown = await response.json();
    if (!result || typeof result !== "object" || !("id" in result) || typeof result.id !== "string") {
      req.log.error("Resend did not confirm review email acceptance");
      res.status(502).json({ error: "Your review could not be submitted. Please try again." });
      return;
    }
    res.json(SubmitReviewResponse.parse({ message: "Thank you! Your review has been submitted for approval." }));
  } catch {
    req.log.error("Failed to send review email");
    res.status(502).json({ error: "Your review could not be submitted. Please try again." });
  }
});

export default router;