# SE(3) Regenerative Metrics Service

**Pillar I (Science) - Open Science DLT**

[![Integration Status](https://img.shields.io/badge/status-deployed-success)]()
[![Validation](https://img.shields.io/badge/validation-required-yellow)]()
[![Provenance](https://img.shields.io/badge/provenance-UCF-blue)](https://github.com/dj-ccs/Unified-Conscious-Evolution-Framework)

---

## Overview

This module provides the **SE(3) Double-and-Scale Regenerative Principle** from the [Unified Conscious Evolution Framework (UCF)](https://github.com/dj-ccs/Unified-Conscious-Evolution-Framework) as a λ-estimation service for computing regenerative metrics from trajectory data.

**Mathematical Foundation**: ADR-0001 - SE(3) Double-and-Scale Regenerative Return
**Reference**: Eckmann & Tlusty (2025), arXiv:2502.14367
**Integration Date**: 2025-11-11
**Session**: `claude/se3-lambda-estimation-service-011CV1jDenzxAxddVhcat8uS`

---

## Quick Start

### 1. Install Dependencies
```bash
cd src/science
pip install -r requirements.txt
```

### 2. Start the Service
```bash
python api_server.py
```
Service runs on `http://localhost:5000`

### 3. Test with Examples
```bash
python example_usage.py
```

### 4. Run Tests
```bash
cd lie_dynamics/tests
pytest test_metrics_service.py -v
```

---

## Usage

### Python API

```python
from lie_dynamics.metrics_service import compute_regenerative_metrics

# Define trajectory (rotation + translation)
trajectory_data = {
    "poses": [
        {"rotation": [0.1, 0, 0], "translation": [0.5, 0, 0]},
        {"rotation": [0, 0.1, 0], "translation": [0, 0.5, 0]}
    ]
}

# Compute metrics
metrics = compute_regenerative_metrics(trajectory_data)

print(f"Optimal λ: {metrics['optimal_lambda']:.4f}")
print(f"Return Error ε: {metrics['return_error_epsilon']:.6f}")
print(f"Verification Score: {metrics['verification_score']:.4f}")
```

### TypeScript Client

```typescript
import { scienceClient } from './science/client';

const metrics = await scienceClient.computeMetrics({
  poses: [
    { rotation: [0.1, 0, 0], translation: [0.5, 0, 0] },
    { rotation: [0, 0.1, 0], translation: [0, 0.5, 0] }
  ]
});

console.log(`Optimal λ: ${metrics.optimal_lambda}`);
console.log(`Verification score: ${metrics.verification_score}`);
```

### REST API

```bash
curl -X POST http://localhost:5000/api/v1/science/metrics \
  -H "Content-Type: application/json" \
  -d '{
    "trajectory_data": {
      "poses": [
        {"rotation": [0.1, 0, 0], "translation": [0.5, 0, 0]}
      ]
    }
  }'
```

---

## API Contract

### Input: `trajectory_data`
- **Poses**: `{"poses": [{"rotation": [x,y,z], "translation": [x,y,z]}, ...]}`
- **Time-Series**: `{"positions": [[x,y,z],...], "orientations": [[x,y,z],...]}`
- **State Vectors**: `{"state_vectors": [[s1,s2,s3,s4,s5,s6],...]}`

### Output: Regenerative Metrics
```json
{
  "optimal_lambda": 0.618,           // Optimal scaling factor λ
  "return_error_epsilon": 0.0234,    // Return error ε to identity
  "verification_score": 0.87,        // Multi-level verification [0, 1]
  "resonance_detected": "golden_ratio",  // Optional: detected resonance
  "confidence": 0.95,                // Confidence in results
  "metadata": {
    "trajectory_length": 10,
    "optimization_success": true,
    ...
  }
}
```

---

## Module Structure

```
src/science/
├── lie_dynamics/              # Python SE(3) modules
│   ├── se3_double_scale.py    # Core SE(3) operations & optimization
│   ├── resonance_aware.py     # Verification cascade (EXPERIMENTAL)
│   ├── metrics_service.py     # Main API: compute_regenerative_metrics()
│   ├── tests/
│   │   └── test_metrics_service.py
│   └── __init__.py
├── api_server.py              # Flask REST API
├── client.ts                  # TypeScript client
├── types.ts                   # TypeScript types
├── example_usage.py           # Usage examples
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

---

## REST Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/science/metrics` | POST | Compute single trajectory metrics |
| `/api/v1/science/metrics/batch` | POST | Batch processing |
| `/api/v1/science/health` | GET | Health check |
| `/api/v1/science/version` | GET | Version & provenance info |

---

## Use Cases

### 🌾 Agricultural Rotation Optimization
Determine optimal intervention intensity for crop rotation cycles (e.g., hemp-wheat-hemp-wheat) to maximize soil health return.

### 🌱 Carbon Sequestration Protocols
Optimize biochar application timing and dosage for maximum long-term carbon stability.

### 📡 Digital Twin Sensor Calibration
Compute optimal sampling rates for sensor networks using double-measurement closure principles.

### 📖 Narrative Quality Assessment
Quantify story satisfaction based on return quality of narrative arcs (EXPERIMENTAL).

---

## Provenance & Reproducibility

### Source Mapping

| Open Science DLT File | UCF Source File |
|----------------------|-----------------|
| `lie_dynamics/se3_double_scale.py` | [`foundations/lie_groups/se3_double_scale.py`](https://github.com/dj-ccs/Unified-Conscious-Evolution-Framework/tree/main/foundations/lie_groups/se3_double_scale.py) |
| `lie_dynamics/resonance_aware.py` | [`foundations/lie_groups/resonance_aware.py`](https://github.com/dj-ccs/Unified-Conscious-Evolution-Framework/tree/main/foundations/lie_groups/resonance_aware.py) |

### Additional UCF References
- **Mathematical Derivation**: See [`ENGINEERING_PROOF_OUTLINE.md`](https://github.com/dj-ccs/Unified-Conscious-Evolution-Framework/blob/main/foundations/lie_groups/ENGINEERING_PROOF_OUTLINE.md)
- **Validation Protocols**: See [`VALIDATION_PROTOCOLS.md`](https://github.com/dj-ccs/Unified-Conscious-Evolution-Framework/blob/main/foundations/lie_groups/VALIDATION_PROTOCOLS.md)
- **Validation Methodology**: See [`VALIDATION_METHODOLOGY.md`](https://github.com/dj-ccs/Unified-Conscious-Evolution-Framework/blob/main/foundations/lie_groups/VALIDATION_METHODOLOGY.md)
- **Development Dialogue**: See [`appendices/PROOF_DIALOGUE.md`](https://github.com/dj-ccs/Unified-Conscious-Evolution-Framework/blob/main/appendices/PROOF_DIALOGUE.md)

All modules include provenance headers tracking source, integration date, and session ID.

---

## ⚠️ Experimental Features & Validation Status

### **EXPERIMENTAL - Requires Validation**

The following features are based on **preliminary observations** and require empirical validation before production use:

#### 🔬 Resonance Detection
- **Hypothesis**: Systems naturally prefer mathematical constants (golden ratio φ ≈ 0.618, silver ratio, etc.)
- **Preliminary Data**: λ ≈ 0.618 appeared in ~40% of trials (N=5)
- **Validation Required**: Monte Carlo trials with N ≥ 1000 across multiple distributions
- **Status**: Research framework for hypothesis testing

#### 🔬 Verification Cascade
- **Purpose**: Multi-level verification (topological, energetic, temporal, spatial, stochastic)
- **Current Use**: Heuristic quality indicator
- **Validation Required**: Field trials (agriculture, carbon sequestration)
- **Status**: NOT production-ready for token economics

### Validation Roadmap

| Phase | Description | Timeline | Status |
|-------|-------------|----------|--------|
| **Phase 1** | Monte Carlo validation (N≥1000) | Q1 2026 | Pending |
| **Phase 2** | Agricultural field trials | Q2-Q4 2026 | Pending |
| **Phase 3** | Carbon sequestration studies | Q3 2026-Q2 2027 | Pending |
| **Phase 4** | Digital twin sensor validation | Q1-Q2 2026 | Pending |

**See Full Validation Methodology**: [UCF VALIDATION_METHODOLOGY.md](https://github.com/dj-ccs/Unified-Conscious-Evolution-Framework/blob/main/foundations/lie_groups/VALIDATION_METHODOLOGY.md)

---

## Known Limitations

1. **Non-Compact Translation Space**: SE(3) requires bounded domains (`r_max`) due to unbounded translations
2. **Non-Convex Optimization**: May find local minima; consider multi-start or global optimization
3. **Small Rotation Assumption**: Large rotations (>π rad) may accumulate numerical errors
4. **Experimental Features**: Resonance detection and verification cascade require validation

---

## Dependencies

**Python:**
- numpy ≥1.24.0
- scipy ≥1.10.0
- flask ≥3.0.0
- flask-cors ≥4.0.0
- pydantic ≥2.0.0
- pytest ≥7.4.0 (testing)

**TypeScript:**
- axios (already in package.json)

---

## Testing

### Unit Tests
```bash
cd lie_dynamics/tests
pytest test_metrics_service.py -v -s
```

### Integration Tests
```bash
# Terminal 1: Start Python service
python api_server.py

# Terminal 2: Test TypeScript client
npm test -- --testPathPattern=science
```

### Example Suite
```bash
python example_usage.py
```

Runs 5 comprehensive examples:
1. Basic trajectory metrics
2. Agricultural rotation cycles
3. Sensor calibration
4. Resonance exploration
5. Batch processing

---

## Configuration

### Environment Variables

**Python Service:**
- `SCIENCE_API_HOST`: Host address (default: `127.0.0.1`)
- `SCIENCE_API_PORT`: Port number (default: `5000`)
- `SCIENCE_API_DEBUG`: Debug mode (default: `false`)

**TypeScript Client:**
- `SCIENCE_SERVICE_URL`: Service URL (default: `http://localhost:5000`)

### `.env` Example
```env
SCIENCE_SERVICE_URL=http://localhost:5000
SCIENCE_API_DEBUG=false
```

---

## Documentation

📚 **Complete Integration Guide**: [`docs/science/SE3_INTEGRATION.md`](../../docs/science/SE3_INTEGRATION.md)

Includes:
- Mathematical background
- Detailed API reference
- Installation & setup
- Use cases & examples
- Provenance tracking
- Future work roadmap

---

## Contributing

When working with this module:

1. **Maintain Provenance**: All new files should include provenance headers
2. **Document Experimental Features**: Clearly mark features requiring validation
3. **Follow Validation Protocols**: See [UCF VALIDATION_PROTOCOLS.md](https://github.com/dj-ccs/Unified-Conscious-Evolution-Framework/blob/main/foundations/lie_groups/VALIDATION_PROTOCOLS.md)
4. **Update Tests**: Add tests for new functionality
5. **Reference UCF**: Link to original UCF files when modifying integrated code

---

## License

MIT License (inherited from both Open Science DLT and UCF)

---

## Support & Contact

- **Documentation**: `docs/science/`
- **Issues**: [GitHub Issues](https://github.com/dj-ccs/open-science-dlt/issues)
- **UCF Repository**: [Unified Conscious Evolution Framework](https://github.com/dj-ccs/Unified-Conscious-Evolution-Framework)
- **Integration Session**: `claude/se3-lambda-estimation-service-011CV1jDenzxAxddVhcat8uS`

---

## Acknowledgments

This module is the **first practical deployment** of the Unified Conscious Evolution Framework's mathematical core, integrating rigorous Lie group theory with regenerative system principles.

**Mathematical Foundation**: Eckmann & Tlusty (2025)
**Framework**: UCF Core Team
**Integration**: Open Science DLT + Collaborative AI (Claude, ChatGPT, Gemini, Edison Scientific, Grok)

---

**Status**: ✅ Deployed | ⚠️ Validation Required | 🔬 Research Framework

*The SE(3) Double-and-Scale Regenerative Principle is now operationally integrated into the Open Science DLT platform.*
