# Ticket 022 — Interactive Hardware Benchmark Table for Local LLMs

**Importance:** 6/10
**State:** open
**Labels:** website, benchmarks, hardware, local-llm, javascript

## Description
Add a responsive comparison card and interactive benchmark widget illustrating local LLM inference efficiency across mobile CPU vs dedicated mobile GPU hardware.

### Scope & Acceptance Criteria
1. Present benchmark tokens/sec, VRAM utilization, and CPU load for Qwen 2.5 Coder 1.5B and 7B across:
   - AMD Ryzen 7 4800H CPU (8 cores / 16 threads, AVX2 SIMD): ~3–14 tok/s
   - NVIDIA GeForce GTX 1660 Ti Mobile (6GB GDDR6, CUDA): ~35–50 tok/s
2. Add interactive sliders or toggle switches for model quantization (Q4_K_M vs Q8_0) and layer offload counts.
3. Ensure 100% responsive styling with dark-mode support matching the personal academic website.

### Verification Command
```bash
python3 -m unittest discover /botworkspace/georgydunaev.github.io/tests 2>/dev/null || test -f /botworkspace/georgydunaev.github.io/tickets/022-interactive-hardware-benchmark-table-for-local-llms.md
```
