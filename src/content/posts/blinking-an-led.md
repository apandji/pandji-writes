---
title: Blinking an LED
pubDate: 2026-08-12
journal: physical-computing
---

The first honest circuit is an LED that turns on because you told it to. Everything after that is a variation: a pin, a delay, a loop.

```cpp
const int ledPin = 9;

void setup() {
  pinMode(ledPin, OUTPUT);
}

void loop() {
  digitalWrite(ledPin, HIGH);
  delay(400);
  digitalWrite(ledPin, LOW);
  delay(400);
}
```

The diagram is almost as small as the sketch. Pin 9 sources current through the LED, then back to ground. A resistor keeps the LED from becoming a fuse.

```mermaid
flowchart LR
  Arduino["Arduino D9"] --> Resistor["220Ω"]
  Resistor --> LED["LED"]
  LED --> GND["GND"]
```

Photos of the breadboard, or a schematic export from KiCad, belong in the post as ordinary images. Mermaid is for the idea of the circuit, not the copper.
