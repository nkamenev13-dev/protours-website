# ProTours

English-language landing page for ProTours day trips from Paris.

## Local preview

Run a static web server in the project directory and open the generated local URL.

## Deployment

The production site is intended to deploy automatically to Railway from the Git repository.

Configure these private Railway variables before using the booking form:

- `TELEGRAM_BOT_TOKEN` — token issued by BotFather
- `TELEGRAM_CHAT_ID` — personal, group or channel chat ID that receives leads
