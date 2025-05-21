import { execSync } from 'child_process';

execSync('npx graphql-codegen', { stdio: 'inherit' });
