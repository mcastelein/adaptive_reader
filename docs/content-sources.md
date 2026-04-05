# Content Sources — Graded Input Feature

Research date: 2026-04-05

---

## Verified Working Sources

### 1. People's Daily (人民网) — Simplified Chinese

| Field | Value |
|-------|-------|
| **URLs** | `http://www.people.com.cn/rss/politics.xml` (politics) |
|         | `http://www.people.com.cn/rss/world.xml` (world news) |
| **Content type** | News — politics, international affairs, domestic policy |
| **Update frequency** | Daily, 70+ items per feed |
| **Sample headline** | 欧洲央行宣布下调欧元区关键利率 |
| **Best CEFR levels** | B1–C1 (formal news register, political vocabulary) |
| **Notes** | Multiple category feeds available. Formal/official tone — good for intermediate+ learners who want real news exposure. |

---

### 2. Xinhua (新华网) — Simplified Chinese

| Field | Value |
|-------|-------|
| **URL** | `http://www.xinhuanet.com/politics/news_politics.xml` |
| **Content type** | News — politics, government, economic policy |
| **Update frequency** | Daily, 200+ items |
| **Sample headline** | 微视频｜"新"在中国 |
| **Best CEFR levels** | B1–C1 (formal news Chinese) |
| **Notes** | ⚠️ Feed content during testing showed items from late 2022. May have intermittent update issues — monitor reliability. Very large feed. |

---

### 3. Wikipedia Chinese — Featured Article API (Simplified Chinese)

| Field | Value |
|-------|-------|
| **URL** | `https://zh.wikipedia.org/api/rest_v1/feed/featured/{YYYY}/{MM}/{DD}` |
| **Content type** | Encyclopedia — featured article, "On this day", most-read articles |
| **Update frequency** | Daily (new featured article each day) |
| **Sample headline** | 贾乃锡 — 陆军中将，加拿大籍英国陆军将领 |
| **Best CEFR levels** | B2–C1 before rewriting (encyclopedic register) |
| **Notes** | Returns JSON with title, extract/summary, thumbnail. Supports `variant=zh-cn` for Simplified. Also includes "most read" articles — could pick popular articles for learners. No RSS — REST API, easy to integrate. |

---

### 4. Wikipedia Chinese — Random Article API (Simplified Chinese)

| Field | Value |
|-------|-------|
| **URL** | `https://zh.wikipedia.org/w/api.php?action=query&list=random&rnnamespace=0&rnlimit=5&format=json` |
| **Content type** | Encyclopedia — random articles |
| **Update frequency** | On demand |
| **Best CEFR levels** | B1–C1 (varies by article) |
| **Notes** | Returns random article titles + IDs. Fetch full extract with a second API call. Good for variety but quality/topic is unpredictable — may need filtering. |

---

### 5. Liberty Times (自由時報) — Traditional Chinese 🇹🇼

| Field | Value |
|-------|-------|
| **URL** | `https://news.ltn.com.tw/rss/all.xml` |
| **Content type** | News — politics, sports, entertainment, society, world |
| **Update frequency** | Continuously, 50 items per fetch |
| **Sample headline** | 清明週一收假恐塞車！省道、快速道路地雷路段出爐 |
| **Best CEFR levels** | B1–B2 (more colloquial than mainland news, accessible topics) |
| **Notes** | Great Traditional Chinese source from Taiwan. Good mix of serious news and lighter lifestyle/entertainment content. More natural/conversational tone than PRC state media. |

---

### 6. NewTalk (新頭殼) — Traditional Chinese 🇹🇼

| Field | Value |
|-------|-------|
| **URL** | `https://newtalk.tw/rss/all` |
| **Content type** | News — politics, entertainment, culture, international |
| **Update frequency** | Continuously, ~34 items per fetch |
| **Sample headline** | 李洪基李昇基高流合體開唱 互相吐槽逗笑歌迷 |
| **Best CEFR levels** | A2–B2 (entertainment content is simpler; politics is harder) |
| **Notes** | Independent Taiwanese media. Entertainment and lifestyle articles are particularly good for lower-level learners after rewriting. |

---

## Failed / Not Usable

| Source | URL Tested | Result |
|--------|-----------|--------|
| BBC Chinese | `https://feeds.bbci.co.uk/chinese/simp/rss.xml` | 404 — feed discontinued |
| VOA Chinese | `https://www.voachinese.com/api/z-moqegepb-o_ux` | Connection refused |
| DW Chinese | `https://rss.dw.com/rdf/rss-chi-all` | Blocked |
| RFI Chinese | `https://www.rfi.fr/cn/rss` | Blocked |
| CGTN RSS | `https://www.cgtn.com/subscribe/rss/section/china.xml` | Works but **English only** |
| ChinaDaily RSS | `https://www.chinadaily.com.cn/rss/china_rss.xml` | Works but **English only** (stale: 2017 content) |
| Zaobao (联合早报) | `https://www.zaobao.com.sg/...` | Blocked |
| NYT Chinese | `https://cn.nytimes.com/rss/` | Blocked |
| The Paper (澎湃) | `https://www.thepaper.cn/rss_newsDetail_wap.jsp` | Not RSS — returns HTML page |

---

## V1 Recommendation: Start With These 3

### 1. People's Daily — World News (`http://www.people.com.cn/rss/world.xml`)
**Why:** Reliable Simplified Chinese feed, updated daily, diverse international topics. Good baseline for B1+ learners. International news is more universally interesting than domestic politics.

### 2. Wikipedia Featured Article API (`https://zh.wikipedia.org/api/rest_v1/feed/featured/{YYYY}/{MM}/{DD}`)
**Why:** Daily fresh content, cultural/educational topics, structured JSON response (no XML parsing needed). Great for B2+ before rewriting. "Most read" articles provide trending content learners actually care about.

### 3. Liberty Times (`https://news.ltn.com.tw/rss/all.xml`)
**Why:** Traditional Chinese support from day one (future Taiwan/HK users). More natural/colloquial tone than PRC sources. Mix of light and serious content — entertainment articles rewrite well for A2–B1.

### Integration Notes

- People's Daily + Liberty Times are standard RSS → parse with a lightweight XML library
- Wikipedia is REST JSON → fetch directly, no parser needed
- All three are free, no API keys required
- For V1: fetch server-side, pick a random recent item, pass raw text to Claude for rewriting
- Consider adding People's Daily Politics feed as a 4th source if users want more variety
