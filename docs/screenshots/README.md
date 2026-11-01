# Screenshots

Sixteen highlights, committed so a pull request can link them. Taken from a production build (`next build && next start`) with Playwright Chromium at 1440×900 (desktop) and 390×844 (phone), device scale factor 1, each scrolled by mouse wheel to the frame shown, because the CSS scroll timelines only paint after real input. They are evidence of layout, not of pixel density.

| File                               | What it shows                                                                                                    |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `home-dark-desktop.png`            | The opening scene mid-way: the name over the field, the report struck through, what it was being written beneath |
| `home-light-mobile.png`            | The same opening on a phone, light theme, resolved: the report struck and what it actually was                   |
| `home-story-dark-desktop.png`      | Selected work as one scroll story: the second study's report and its drawing pinned beside its step              |
| `home-story-light-mobile.png`      | The same story on a phone: a card per study, its drawing drawn in, and its Try it                                |
| `work-dark-desktop.png`            | The case study index, each card led by the reported quote                                                        |
| `draft-sync-light-desktop.png`     | The offline sync simulator pinned at its end, without ownership: the stale draft lands and the record reverts    |
| `draft-sync-light-mobile.png`      | The same simulator in flow on a phone, its run played to the revert, the policy toggle and Replay on screen      |
| `tax-ladder-dark-desktop.png`      | The tax ladder playground fully printed: both receipts, the gap over one ladder, and the two rates to move       |
| `gate-run-light-desktop.png`       | The release gate run at its last beat: quarantined debt named, permission matrix checked, release certified      |
| `approval-engine-dark-desktop.png` | The approval engine on the hard-coded approver: right for one customer, wrong for the other, with who is skipped |
| `about-timeline-light-desktop.png` | The about arc pinned: period marker, spine, the era's scene and the layers owned at 4 of 7                       |
| `about-timeline-dark-mobile.png`   | The about arc on a phone: an era card with its scene, its layers strip and the next era coming in                |
| `contagion-model-dark-desktop.png` | The published contagion model as an element: the running field, its counts and its controls                      |
| `stack-dark-desktop.png`           | `/stack` pinned on "Offline-first and on-device": the group's scene beside its card of tools                     |
| `stack-light-mobile.png`           | `/stack` on a phone: the Domain card with its scene and the start of its sub-lists                               |
| `mobile-menu-light-mobile.png`     | The mobile menu open over `/work`: the routes, the current one marked, and the theme switch                      |

The full set — every route, both themes, both breakpoints — is regenerated from live code into `../private/screens/`, which is git-ignored. A screenshot that does not match shipped code is worse than none, because it gets reviewed.
