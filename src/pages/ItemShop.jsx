import React, { useState } from "react";
import { Coins, ArrowLeft, ArrowRight } from "lucide-react";
import AppShell from "../components/AppShell";

const CATEGORIES = ["모자", "상의", "하의", "안경", "장식"];

const ITEMS_BY_CATEGORY = {
  모자: [
    { id: "beanie", label: "빨간 비니", price: 120, emoji: "🧢" },
    { id: "crown", label: "골드 왕관", price: 300, emoji: "👑" },
    { id: "santa", label: "산타 모자", price: 150, emoji: "🎅" },
  ],
  상의: [
    { id: "hoodie", label: "후드티", price: 90, emoji: "👕" },
    { id: "suit", label: "정장 재킷", price: 220, emoji: "🥼" },
  ],
  하의: [{ id: "jeans", label: "청바지", price: 80, emoji: "👖" }],
  안경: [
    { id: "glasses", label: "동그란 안경", price: 60, emoji: "👓" },
    { id: "sunglasses", label: "선글라스", price: 70, emoji: "🕶️" },
  ],
  장식: [
    { id: "scarf", label: "체크 목도리", price: 80, emoji: "🧣" },
    { id: "bowtie", label: "리본 타이", price: 50, emoji: "🎀" },
  ],
};

function MascotPreview({ equippedItems }) {
  return (
    <div className="relative flex h-full min-h-[420px] flex-col items-center justify-center rounded-[2.5rem] bg-gradient-to-b from-[#06275a] to-[#5780be]">
      <div className="absolute top-[14%] flex gap-2 text-4xl">
        {equippedItems.map((item) => (
          <span key={item.id}>{item.emoji}</span>
        ))}
      </div>
      <div className="relative">
        <div className="h-40 w-40 rounded-full bg-white" />
        <div className="absolute left-1/2 top-[70%] h-52 w-52 -translate-x-1/2 rounded-full bg-white" />
        <span className="absolute left-[32%] top-[24%] h-3 w-3 rounded-full bg-moram-navy" />
        <span className="absolute left-[58%] top-[24%] h-3 w-3 rounded-full bg-moram-navy" />
      </div>
      <div className="absolute bottom-10 h-6 w-56 rounded-full bg-black/20 blur-sm" />
    </div>
  );
}

export default function ItemShop() {
  const [coins, setCoins] = useState(250);
  const [owned, setOwned] = useState(["glasses"]);
  const [equipped, setEquipped] = useState({ 안경: "glasses" });
  const [category, setCategory] = useState("모자");
  const [categoryIndex, setCategoryIndex] = useState(0);

  const items = ITEMS_BY_CATEGORY[category];
  const equippedItems = Object.values(equipped)
    .filter(Boolean)
    .map((id) => Object.values(ITEMS_BY_CATEGORY).flat().find((i) => i.id === id))
    .filter(Boolean);

  const handleBuy = (item) => {
    if (owned.includes(item.id) || coins < item.price) return;
    setCoins((c) => c - item.price);
    setOwned((prev) => [...prev, item.id]);
  };

  const handleEquip = (item) => {
    setEquipped((prev) => ({
      ...prev,
      [category]: prev[category] === item.id ? null : item.id,
    }));
  };

  const changeCategory = (delta) => {
    const nextIndex = (categoryIndex + delta + CATEGORIES.length) % CATEGORIES.length;
    setCategoryIndex(nextIndex);
    setCategory(CATEGORIES[nextIndex]);
  };

  return (
    <AppShell>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-moram-navy">아이템 보관함</h1>
          <div className="flex items-center gap-2 rounded-full bg-[#ffd000]/30 px-4 py-2 font-bold text-[#7a5b00]">
            <Coins className="h-5 w-5" />
            {coins}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div className="relative">
            <MascotPreview equippedItems={equippedItems} />
            <button
              type="button"
              onClick={() => changeCategory(-1)}
              aria-label="이전 카테고리"
              className="absolute left-3 top-3 text-white/80 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          </div>

          <div className="rounded-[2rem] border-2 border-black/10 bg-[#d2dbec]/30 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex gap-4">
                {CATEGORIES.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setCategory(c);
                      setCategoryIndex(i);
                    }}
                    className={`text-lg font-black transition ${
                      category === c ? "text-moram-navy" : "text-moram-navy/40"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => changeCategory(1)} aria-label="다음 카테고리" className="text-moram-navy/60 hover:text-moram-navy">
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {items.map((item) => {
                const isOwned = owned.includes(item.id);
                const isEquipped = equipped[category] === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => (isOwned ? handleEquip(item) : handleBuy(item))}
                    className={`flex flex-col items-center gap-1 rounded-[1.5rem] border-2 bg-white/70 p-4 transition ${
                      isEquipped ? "border-moram-navy" : "border-transparent hover:border-black/10"
                    }`}
                  >
                    <span className="text-3xl">{item.emoji}</span>
                    <span className="text-xs font-semibold text-moram-navy">{item.label}</span>
                    {isOwned ? (
                      <span className="text-[11px] font-bold text-emerald-600">
                        {isEquipped ? "착용 중" : "보유 중"}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-[#7a5b00]">
                        <Coins className="h-3 w-3" /> {item.price}
                      </span>
                    )}
                  </button>
                );
              })}
              {Array.from({ length: Math.max(0, 9 - items.length) }).map((_, i) => (
                <div key={i} className="rounded-[1.5rem] bg-white/40" style={{ minHeight: 96 }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
