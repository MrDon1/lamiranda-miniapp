import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

BOT_TOKEN = "6323580198:AAF-Dew4irtpiHE0Q-Y_fGdq1ggMPWvOQ2I"

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

async def main():
    print("Bot ishga tushdi! ✅")
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())