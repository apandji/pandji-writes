---
title: The gulf of execution
pubDate: 2026-08-18
journal: programming-usable-interfaces
---

An interface feels usable when the next action is obvious, and the result of that action is obvious too. Don Norman calls the gap between intention and action the gulf of execution.

A useful check while designing: can someone form a goal, see what to do, do it, and know that it worked — without a manual?

```mermaid
flowchart LR
  Goal[What I want] --> Intention[What I will do]
  Intention --> Action[What I actually do]
  Action --> Interface[The thing I can see]
  Interface --> Goal
```

If that loop needs extra explanation, the interface is doing too little of the work.
