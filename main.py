import asyncio
import json
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

BOT_TOKEN = "6323580198:AAF-Dew4irtpiHE0Q-Y_fGdq1ggMPWvOQ2I"
ADMIN_ID = 922144681  # masalan: 123456789

bot = Bot(token=BOT_TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start(message: types.Message):
    keyboard = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(
            text="🎂 La Miranda'ni ochish",
            web_app=WebAppInfo(url="https://lamiranda-miniapp.vercel.app")
        )]
    ])
    await message.answer(
        "👋 Assalomu alaykum!\n\n"
        "🎂 La Miranda shirinlik do'koniga xush kelibsiz!\n\n"
        "Buyurtma berish uchun quyidagi tugmani bosing 👇",
        reply_markup=keyboard
    )

@dp.message()
async def handle_web_app_data(message: types.Message):
    if message.web_app_data:
        try:
            data = json.loads(message.web_app_data.data)
            order_id = data.get('order_id', '')
            name = data.get('name', '')
            phone = data.get('phone', '')
            address = data.get('address', '')
            total = data.get('total', 0)
            items = data.get('items', [])

            items_text = ""
            for item in items:
                items_text += f"  • {item['name']} x{item['qty']} — {item['price']:,} so'm\n"

            text = (
                f"🛒 *Yangi buyurtma #{order_id}*\n\n"
                f"👤 *Mijoz:* {name}\n"
                f"📞 *Telefon:* {phone}\n"
                f"📍 *Manzil:* {address}\n\n"
                f"🛍 *Mahsulotlar:*\n{items_text}\n"
                f"💰 *Jami:* {total:,} so'm"
            )

            await bot.send_message(ADMIN_ID, text, parse_mode="Markdown")
            await message.answer("✅ Buyurtmangiz qabul qilindi!")

        except Exception as e:
            print(f"Xato: {e}")

async def main():
    print("Bot ishga tushdi! ✅")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())