# Static publishing regression check

This read-only check catches the SPA fallback returning HTML instead of existing
crawler files or homepage JavaScript/CSS. It does not publish or change hosting,
and does not test whether sitemap page links resolve.

1. Verify the current deployment's primary URL using deployment metadata
   (`getDeploymentInfo` in the deployment skill). Do not substitute a preview URL
   or assume that a previously used production URL is still current.
2. Run from the workspace root, supplying that verified HTTPS origin:

   ```sh
   pnpm --filter @workspace/scripts check:static-publishing https://verified-primary-domain.example
   ```

The command checks the homepage, `/sitemap.xml`, `/robots.txt`, and every
same-origin script, stylesheet, and module preload referenced by the homepage.
Asset names are discovered on each run, not pinned to build hashes. Third-party
fonts and scripts are excluded. Both normal and no-cache requests are checked;
no-cache requests send `Cache-Control: no-cache` and `Pragma: no-cache`.
It requires HTTP 200, the proper Content-Type, nonempty content, and no HTML
fallback or unexpected redirect. Failures list the request mode and URL and exit
nonzero. Network requests have a 20-second timeout.

Run the checker’s deterministic regression tests without contacting production:

```sh
pnpm --filter @workspace/scripts test:static-publishing
```

Keep static serving and the existing-file-before-SPA-fallback behavior in both
`.replit` and
`artifacts/better-than-your-husband-services/.replit-artifact/artifact.toml`.
The existing website `src/static-routing.test.ts` guards the hosting target and
fallback configuration. This live check complements it by testing actual
publisher responses. Passing against the current release does not validate
unpublished changes; run it again after an owner-initiated publish.
