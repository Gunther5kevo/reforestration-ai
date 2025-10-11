const axios = require("axios");
const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config();

// 🌍 Auto-detect keys (supports VITE_ or normal)
const trefleKey =
  process.env.TREFLE_API_KEY || process.env.VITE_TREFLE_API_KEY;
const openaiKey =
  process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

// 🌳 Trefle test
async function testTrefle() {
  console.log("🌳 Testing Trefle API...");
  try {
    if (!trefleKey) throw new Error("No Trefle API key found (.env)");
    const url = `https://trefle.io/api/v1/species/search?token=${trefleKey}&q=acacia`;
    const res = await axios.get(url);
    const species = res.data?.data || [];
    console.log(`✅ Trefle returned ${species.length} species`);
    if (species.length > 0) {
      const s = species[0];
      console.log("Example:", s.common_name || s.scientific_name);
      console.log("Soil info:", s.main_species?.specifications?.growth_soil || "🌱 (no soil data)");
    }
  } catch (err) {
    console.error("❌ Trefle test failed:", err.response?.status, err.message);
  }
}

// 🤖 OpenAI test
async function testOpenAI() {
  console.log("\n🤖 Testing OpenAI API...");
  try {
    if (!openaiKey) throw new Error("No OpenAI API key found (.env)");
    const openai = new OpenAI({ apiKey: openaiKey });
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are ReForest.AI, an environmental assistant." },
        { role: "user", content: "List two tree species suited for semi-arid climates." },
      ],
    });
    console.log("✅ OpenAI response:");
    console.log(res.choices[0].message.content);
  } catch (err) {
    console.error("❌ OpenAI test failed:", err.message);
  }
}

// 🚀 Run both
(async () => {
  console.log("🌍 Starting API tests...\n");
  console.log("🔑 Trefle key loaded:", !!trefleKey);
  console.log("🔑 OpenAI key loaded:", !!openaiKey, "\n");

  await testTrefle();
  await testOpenAI();

  console.log("\n✅ Tests complete.");
})();
