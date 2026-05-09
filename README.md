<p align="center">
  <br>
  <a href="https://github.com/Dr-Floofers/Cleanenv">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./resources/logo.svg">
      <source media="(prefers-color-scheme: light)" srcset="./resources/logo-light.svg">
      <img src="./resources/logo.svg" alt="Cleanenv">
    </picture>
  </a>
  <br>
  <br>
  <span>Audit and fix your .env files in seconds</span>
</p>

## Usage

```bash
npx cleanenv-v1
```
No install needed. Just run it from your project root.

### Example Output

```
scanning project...
found 2 env file(s)

.env vs .env.example
  ├─ missing  SECRET_KEY, DEBUG
  ├─ empty    API_KEY
  ├─ unused   OLD_TOKEN
  └─ ok       DATABASE_URL

.env.staging vs .env.staging.example
  └─ ok

────────────────────────────────────────
summary  1 clean   3 warnings   1 errors

  3 issues can be fixed automatically (2 missing, 1 unused)
  1 issue needs manual attention: empty values (API_KEY)

  !  This will write to your .env files.
  Fix automatically? (Y/n) › y
  +  .env — added SECRET_KEY=change_me, DEBUG=false (placeholder — fill in your real value), removed OLD_TOKEN
```

## How it Works

- Scans your project for all `.env*` files
- Pairs each one with its matching example file
- Detects and reports missing, unused, and empty variables
- (Optional) Automatically fix issues by scaffolding missing keys and removing unused ones

> [!NOTE]
> If no specific example is found for any `.env*`, it will use `.env.example` instead
