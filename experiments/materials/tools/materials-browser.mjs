// Real-browser checks for the private material candidate. Call from check.mjs.
// These are prepared gates, not evidence until the browser run completes.
import assert from "node:assert/strict";
import { join } from "node:path";

export async function checkMaterialAtelier(browser, base, root, problems) {
  const page = await browser.newPage({
    viewport: { width: 1360, height: 1000 },
  });
  page.on("pageerror", (error) => problems.push(String(error)));
  await page.goto(base + "/");
  await page.evaluate(() => localStorage.setItem("hmp:theme", "dusk"));
  await page.goto(base + "/atelier.html");
  await page.waitForFunction(() => window.Hypermetapunk?.worlds);
  const snapshot = () =>
    page.locator("#scene").evaluate((canvas) => canvas.toDataURL());
  assert.equal(
    await page.evaluate(() => Hypermetapunk.theme.get()),
    "raeverfaelt",
  );
  assert.equal(await page.locator("#look").inputValue(), "raeverfaelt");

  const looks = await page.evaluate(() =>
    Hypermetapunk.looks.map((look) => look.id),
  );
  for (const width of [1360, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const look of looks) {
      await page.locator("#look").selectOption(look);
      assert.equal(await page.evaluate(() => Hypermetapunk.theme.get()), look);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      for (const layer of ["surface", "subterrain"]) {
        await page.locator("#layer").selectOption(layer);
        const pixels = await snapshot();
        for (const inverted of [false, true]) {
          if (inverted) await page.locator("#inversion").click();
          assert.equal(
            await page
              .locator("#palette-viewport")
              .evaluate((el) => getComputedStyle(el).filter),
            inverted ? "invert(1)" : "none",
          );
          assert.equal(
            await snapshot(),
            pixels,
            "CSS filter must not also invert the canvas buffer",
          );
          await page.locator("figure").screenshot({
            path: join(
              root,
              `test-results/atelier-${look}-${layer}-${width}-${inverted ? "inverted" : "normal"}.png`,
            ),
          });
          if (inverted) await page.locator("#inversion").click();
        }
      }
    }
  }

  await page.locator("#reset").click();
  await page.locator("#sky").selectOption("contrast");
  const blackSky = await snapshot();
  await page.locator("#sky").selectOption("strawberry");
  assert.notEqual(await snapshot(), blackSky);
  await page.locator("#reset").click();
  const initial = await snapshot();
  await page.locator("#dab").focus();
  await page.keyboard.press("Enter");
  assert.notEqual(
    await snapshot(),
    initial,
    "Keyboard painting alternative changes pigment",
  );
  await page.locator("#reset").click();
  assert.equal(await snapshot(), initial);

  await page.locator("#paint").click();
  assert.equal(
    await page
      .locator("#scene")
      .evaluate((c) => getComputedStyle(c).touchAction),
    "none",
  );
  await page.locator("#scene").scrollIntoViewIfNeeded();
  const bounds = await page.locator("#scene").boundingBox();
  await page.mouse.move(
    bounds.x + bounds.width * 0.5,
    bounds.y + bounds.height * 0.78,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width * 0.6,
    bounds.y + bounds.height * 0.8,
  );
  await page.mouse.up();
  await page.evaluate(() => new Promise(requestAnimationFrame));
  assert.notEqual(await snapshot(), initial);
  await page.locator("#paint").click();
  assert.equal(
    await page
      .locator("#scene")
      .evaluate((c) => getComputedStyle(c).touchAction),
    "pan-y",
  );
  await page.locator("#shower").click();
  assert.equal(await page.locator("#look").inputValue(), "rainprint");
  assert.equal(await page.locator("#rain").inputValue(), "50");
  assert.equal(
    await page.evaluate(() => localStorage.getItem("hmp:theme")),
    "dusk",
    "Atelier view is not persisted",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.locator("#reset").click();
  const napStart = await snapshot();
  await page.locator("#reverse-nap").focus();
  await page.keyboard.press("Enter");
  assert.notEqual(await snapshot(), napStart);
  await page.keyboard.press("Enter");
  assert.equal(await snapshot(), napStart);
  // R3 independent-review regressions: actual browser label ownership and modes.
  for (const id of ["detail", "rain", "nap"]) {
    assert.ok(
      await page
        .locator(`#${id}`)
        .evaluate((el) =>
          [...el.labels].some((label) => label.htmlFor === el.id),
        ),
      `${id} must own its visible label`,
    );
  }
  await page.locator("#brush").click();
  await page.locator("#shower").click();
  assert.equal(
    await page.locator("#brush").getAttribute("aria-pressed"),
    "false",
  );
  assert.equal(
    await page
      .locator("#scene")
      .evaluate((el) => getComputedStyle(el).touchAction),
    "pan-y",
  );
  await page.locator("#inversion").click();
  await page.emulateMedia({ media: "print" });
  assert.deepEqual(
    await page
      .locator("#palette-viewport")
      .evaluate((el) => ({
        background: getComputedStyle(el).backgroundColor,
        color: getComputedStyle(el).color,
        filter: getComputedStyle(el).filter,
      })),
    { background: "rgb(255, 255, 255)", color: "rgb(0, 0, 0)", filter: "none" },
  );
  await page.emulateMedia({ media: "screen" });
  await page.emulateMedia({ forcedColors: "active" });
  await page.waitForFunction(
    () => document.getElementById("inversion").disabled,
  );
  assert.equal(
    await page
      .locator("#palette-viewport")
      .evaluate((el) => getComputedStyle(el).filter),
    "none",
  );
  assert.equal(
    await page.evaluate(
      () =>
        Hypermetapunk.worlds.draw(
          document.querySelector("canvas").getContext("2d"),
          {},
        ).animated,
    ),
    false,
  );
  await page.close();
  console.log(
    "PASS: material atelier lifecycle,8 looks ×2 strata ×2 widths ×normal/inverted; sky mixing,keyboard dab and nap,pointer paint,forced colors,reset and visit-only state.",
  );
}
