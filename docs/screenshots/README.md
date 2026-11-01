# Screenshots

> **Being retaken.** The surfaces marked _outdated_ below changed after these were taken and no longer match shipped code; those marked _needs a take_ have none yet. The files stay until the new set replaces them.

Thirteen highlights, committed so a pull request can link them. Taken at device scale factor 1 — they are evidence of layout, not of pixel density. Each is from a production build, scrolled by mouse wheel to the frame shown, because the CSS scroll timelines only paint after real input.

| File                               | What it shows                                                                                                   |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `home-dark-desktop.png`            | _Outdated._ The page at load: the name over the pool, before the opening scene moves, dark theme                |
| `home-light-mobile.png`            | _Outdated._ The same opening on a phone, light theme — one `h1` across both layouts                             |
| `hero-intro-dark-desktop.png`      | _Outdated._ The opening scene resolved: the report struck through, what it was beneath it                       |
| `hero-intro-light-mobile.png`      | _Outdated._ The same resolved scene on a phone, light theme                                                     |
| `home-story-dark-desktop.png`      | _Outdated._ Selected work as one scroll story: the report and a drawing of the mechanism pinned beside its step |
| `home-story-light-mobile.png`      | _Outdated._ The same story on a phone: a card per study, its drawing drawn in, and its Try it                   |
| `about-timeline-light-desktop.png` | _Outdated._ The about arc as a timeline: period marker, spine and the era's scene pinned beside its step        |
| `work-dark-desktop.png`            | _Outdated._ The case study index, each card led by the reported quote                                           |
| `case-study-light-desktop.png`     | A case study mid-read: the part rail marks where the reader is, beside the staged diagram                       |
| `draft-sync-light-desktop.png`     | The offline sync simulator at its end, without ownership: the stale draft lands and the record reverts          |
| `tax-ladder-dark-desktop.png`      | The tax ladder playground fully printed: both receipts, the gap, and the two rates to move                      |
| `gate-run-light-desktop.png`       | The release gate run at its last beat: quarantined debt named, matrix checked, release certified                |
| `contagion-model-dark-desktop.png` | The published contagion model, running its guided walk                                                          |
| _not yet taken_                    | _Needs a take._ `/stack`: the isometric stack, each slab with its name, symbol and item tiles                   |
| _not yet taken_                    | _Needs a take._ The approval case study: one requisition through both customers' ladders, both engines          |

The full set — every route, both themes, both breakpoints — is regenerated from live code into `../private/screens/`, which is git-ignored. A screenshot that does not match shipped code is worse than none, because it gets reviewed.
