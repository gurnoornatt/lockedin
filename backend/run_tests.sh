#!/bin/bash

# Change to the backend directory
cd "$(dirname "$0")"

# Run pytest
python -m pytest tests/ -v 