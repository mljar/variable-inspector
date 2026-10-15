# Dependency security

Reviewed on 2026-10-15. Build from source with Node.js >=22.12.0; the patched
HTML sanitizer requires this version. Prebuilt Python wheels do not need Node.js.

The lockfiles update vulnerable dependencies within their existing ranges.
The `resolutions` entries select patched versions where upstream constraints
exclude them, including `serialize-javascript`, `postcss-selector-parser`, and
`sanitize-html`.

Webpack stays in the patched `>=5.104.1 <5.107.0` range because the current
JupyterLab builder uses a license plugin that fails with newer Webpack versions
([upstream issue](https://github.com/jupyterlab/jupyterlab/issues/18984)).

Recheck all dependencies, including development tooling:

```sh
jlpm npm audit --all --recursive
```

## Remaining upstream advisory

[GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)
affects `braces` <=3.0.3. No patched release is available as of this review.
It can exhaust the Node.js stack when parsing deeply nested brace patterns.
The dependency paths here are glob matching in build/lint/test tools, including
JupyterLab's transitive Jest dependencies. Application searches do not pass their
input to `braces`.

This finding remains visible in audits; it is not suppressed. Revisit it when
upstream publishes a fix or the parent tools remove the dependency.
