import fs from "fs-extra";

import { dataFile } from "./paths";

const WEBSITE_INFO_FILE = dataFile("website_info.json");
const FOOD_OPTIONS_FILE = dataFile("food_options.json");
const STORY_FILE = dataFile("story.json");

function pick<T>(rows: Array<Record<string, unknown>>, itemKey: string, valueKey = "Value"): string {
  const norm = (s: string) => s.toLowerCase().replace(/\s/g, "_");
  const row = rows.find((r) => {
    const item = r.Item ?? r.item;
    return item && norm(String(item)) === norm(itemKey);
  });
  if (!row) return "";
  const v = row[valueKey] ?? row.value;
  return v != null ? String(v).trim() : "";
}

export interface WebsiteInfo {
  dress_code: string;
  gifts: string;
  food_options: { starters: string[]; mains: string[]; desserts: string[] };
  story: Array<{ id: string; date: string; title: string; description: string }>;
  banking: {
    bank_name: string;
    account_holder: string;
    account_type: string;
    account_number: string;
    branch_code: string;
    formatted: string;
  };
}

export async function loadWebsiteInfo(): Promise<WebsiteInfo> {
  const defaults: WebsiteInfo = {
    dress_code: "TBD",
    gifts: "TBD",
    food_options: { starters: [], mains: [], desserts: [] },
    story: [],
    banking: {
      bank_name: "TBD",
      account_holder: "TBD",
      account_type: "TBD",
      account_number: "TBD",
      branch_code: "TBD",
      formatted: "TBD",
    },
  };

  try {
    let websiteRows: Array<Record<string, unknown>> = [];
    if (await fs.pathExists(WEBSITE_INFO_FILE)) {
      websiteRows = (await fs.readJSON(WEBSITE_INFO_FILE)) as Array<Record<string, unknown>>;
    }

    const dress_code = pick(websiteRows, "dress_code") || defaults.dress_code;
    const gifts = pick(websiteRows, "gifts") || defaults.gifts;
    const bank_name = pick(websiteRows, "bank_name") || "TBD";
    const account_holder = pick(websiteRows, "account_holder") || pick(websiteRows, "account_name") || "TBD";
    const account_type = pick(websiteRows, "account_type") || "";
    const account_number = pick(websiteRows, "account_number") || "TBD";
    const branch_code = pick(websiteRows, "branch_code") || "TBD";

    const hasBanking = bank_name !== "TBD" && account_holder !== "TBD" && account_number !== "TBD";
    const parts: string[] = [];
    if (hasBanking) {
      parts.push(bank_name, account_holder);
      if (account_type) parts.push(account_type);
      parts.push(account_number);
      if (branch_code !== "TBD") parts.push(`Branch: ${branch_code}`);
    }
    const formatted = hasBanking ? parts.join(" | ") : "TBD";

    let foodRows: Array<Record<string, unknown>> = [];
    if (await fs.pathExists(FOOD_OPTIONS_FILE)) {
      foodRows = (await fs.readJSON(FOOD_OPTIONS_FILE)) as Array<Record<string, unknown>>;
    }

    const getCourse = (name: string) => {
      const norm = (s: string) => s.toLowerCase().trim();
      return foodRows
        .filter((r) => {
          const c = r.Course ?? r.course;
          return c && norm(String(c)) === norm(name);
        })
        .map((r) => String(r.Option ?? r.option ?? "").trim())
        .filter(Boolean);
    };

    const starters = getCourse("Starter") || getCourse("Starters");
    const mains = getCourse("Main") || getCourse("Mains") || getCourse("Main Course");
    const desserts = getCourse("Dessert") || getCourse("Desserts");

    let storyRows: Array<Record<string, unknown>> = [];
    if (await fs.pathExists(STORY_FILE)) {
      storyRows = (await fs.readJSON(STORY_FILE)) as Array<Record<string, unknown>>;
    }

    const story = storyRows
      .sort((a, b) => Number(a.Order ?? a.order ?? 0) - Number(b.Order ?? b.order ?? 0))
      .map((r, i) => ({
        id: String(i + 1),
        date: String(r.Date ?? r.date ?? ""),
        title: String(r.Title ?? r.title ?? ""),
        description: String(r.Description ?? r.description ?? ""),
      }))
      .filter((s) => s.date || s.title);

    return {
      dress_code,
      gifts,
      food_options: { starters, mains, desserts },
      story: story.length ? story : defaults.story,
      banking: {
        bank_name,
        account_holder,
        account_type,
        account_number,
        branch_code,
        formatted,
      },
    };
  } catch (err) {
    return defaults;
  }
}
