import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On Windows, process.cwd() returns lowercase drive letter (e.g. c:\...)
// but vitest's getImporter() uses pathe.resolve() which uppercases it (C:\...).
// When root = uppercase C:/, rpc.resolve() correctly identifies resolvedId as within root,
// returning server-relative URLs (/src/...) for both mock registration and module fetching.
// This ensures getDependencyMockByUrl() lookup matches and vi.mock() factory works.
import { resolve as patheResolve } from 'pathe'
const root = patheResolve(process.cwd())

export default defineConfig({
  root,
  base: '/adventure_trip_planner/',
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: ['./src/test-setup.js'], globals: true, root },
})
