# Screenshots

Five highlights, committed so a pull request can link them. Taken at device scale factor 1 — they are evidence of layout, not of pixel density.

| File                               | What it shows                                                     |
| ---------------------------------- | ----------------------------------------------------------------- |
| `home-dark-desktop.png`            | The hero: name beside the pool, dark theme                        |
| `home-light-mobile.png`            | The same hero stacked, light theme — one `h1` across both layouts |
| `work-dark-desktop.png`            | The case study index, each card led by the reported quote         |
| `case-study-light-desktop.png`     | A case study's four parts, with the mechanism diagram             |
| `contagion-model-dark-desktop.png` | The published contagion model, running                            |

The full set — every route, both themes, both breakpoints — is regenerated from live code into `../private/screens/`, which is git-ignored. A screenshot that does not match shipped code is worse than none, because it gets reviewed.
