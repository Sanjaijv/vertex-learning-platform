import { defineCliConfig } from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
const dataset = process.env.SANITY_STUDIO_DATASET

export default defineCliConfig({
  api: { projectId, dataset },
  deployment: { appId: 'oh1by19xmo0r1vbr4kcwmull' },
  typegen: {
    enabled: true,
    path: '../{app,sanity}/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../sanity.types.ts',
    overloadClientMethods: true,
  },
})
