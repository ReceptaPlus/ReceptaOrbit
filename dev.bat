@echo off
SET PATH=C:\Program Files\nodejs;%PATH%
cd /d "C:\Users\Unknown User\bem-popular\recepta-orbit-web"
SET NODE_OPTIONS=--max-old-space-size=4096
npx next dev
