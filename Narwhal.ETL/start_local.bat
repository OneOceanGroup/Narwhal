@echo off

title Narwhal - ETL

python -m pip install pymongo paho-mqtt
python %~dp0\process.py