# Product repository migration

**Goal:** Publish the existing product site from `CS-wude/product`; keep `CS-wude/CS-wude.github.io` dedicated to the blog.

**Architecture:** Preserve `/product/` and all existing product content. Give product its own dependency lock, build verification and Pages workflow. Retain both satellite repositories as optional submodules for local previews; the blog CI must run without either submodule or their dependencies.

**Validation:** Build product independently, verify nine rendered pages and their assets, run the existing blog tests, confirm the blog artifact excludes both satellite sites, and verify both new deployments and live URLs.

- [x] Add product-local social image generation, lockfile, verification, README and Pages workflow. All 9 product pages passed verification.
- [x] Change blog deployment to dependency-free blog tests and `assemble-site.mjs --blog-only`; retain combined preview explicitly. All 49 blog tests and 3 combined-preview checks passed; blog artifact excludes both satellites.
- [x] Create and publish `CS-wude/product`, then replace the tracked product directory with its submodule. Product deployment run `34726728999` succeeded at commit `6800d521a05b71403818c9626d4a42e664d828cb`.

Release gate: publish the blog commit, confirm its Actions deployment succeeds, verify live blog/product/FDE URLs, and check clean repositories. Deployment results are reported in the task after this commit is published.
