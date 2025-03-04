import { validateScore } from "../validateScore";
import { describe, test, expect } from "vitest";

describe("validateScore", () => {
  // Basisvalidierung: gültige Werte und ungültige Eingaben
  describe("Basisvalidierung", () => {
    test("Gültige Punktzahl liefert korrekte Ergebnisse", () => {
      const result = validateScore(80);
      expect(result.valid).toBe(true);
      expect(result.score).toBe(80);
      expect(result.errors).toHaveLength(0);
    });

    test("Fehlende Punktzahl", () => {
      const result = validateScore(undefined);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Score ist erforderlich");
    });

    test("Nicht-numerischer Score", () => {
      const result = validateScore("80");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Score muss eine Zahl sein");
    });

    test("Score außerhalb der Grenzen", () => {
      const lowResult = validateScore(-1);
      expect(lowResult.valid).toBe(false);
      expect(lowResult.errors).toContain(
        "Score muss zwischen 0 und 100 liegen"
      );

      const highResult = validateScore(101);
      expect(highResult.valid).toBe(false);
      expect(highResult.errors).toContain(
        "Score muss zwischen 0 und 100 liegen"
      );
    });
  });

  // Strikte Validierung (wenn strictMode aktiviert ist)
  describe("Strikte Validierung", () => {
    test("Score muss eine ganze Zahl sein", () => {
      const result = validateScore(80.5, { strictMode: true });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Score muss eine ganze Zahl sein");
    });

    test("Score muss eine gültige Zahl sein", () => {
      const result = validateScore(Infinity, { strictMode: true });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Score muss eine gültige Zahl sein");
    });
  });

  // Bonuskategorien und deren Auswirkung auf die Endpunktzahl
  describe("Bonuskategorien", () => {
    test("Bonus wird korrekt addiert", () => {
      // 3 Kategorien: bonusPoints = Math.min(3*2, 10) = 6
      const result = validateScore(80, { bonusCategories: ["a", "b", "c"] });
      expect(result.score).toBe(86);
    });

    test("Bonus darf die maximale Punktzahl nicht überschreiten", () => {
      // 6 Kategorien: bonusPoints = Math.min(6*2, 10) = 10, also wäre 95+10 => 100 (nicht 105)
      const result = validateScore(95, {
        bonusCategories: ["a", "b", "c", "d", "e", "f"],
      });
      expect(result.score).toBe(100);
    });
  });

  // Bestandsprüfung mit verschiedenen Schwellenwerten & Notenberechnung
  describe("Bestandsprüfung und Notenberechnung", () => {
    test("Standard Passing Score (60) und richtige Noten", () => {
      // Score 59 => F
      let result = validateScore(59);
      expect(result.passed).toBe(false);
      expect(result.grade).toBe("F");

      // Score 60 => D
      result = validateScore(60);
      expect(result.passed).toBe(true);
      expect(result.grade).toBe("D");

      // Score 75 => C
      result = validateScore(75);
      expect(result.passed).toBe(true);
      expect(result.grade).toBe("C");

      // Score 85 => B
      result = validateScore(85);
      expect(result.passed).toBe(true);
      expect(result.grade).toBe("B");

      // Score 95 => A
      result = validateScore(95);
      expect(result.passed).toBe(true);
      expect(result.grade).toBe("A");
    });

    test("Custom passingScore wirkt sich auf Bestandsprüfung aus", () => {
      // Mit passingScore 50: Score 55 soll bestehen
      let result = validateScore(55, { passingScore: 50 });
      expect(result.passed).toBe(true);

      // Mit passingScore 70: Score 69 soll durchfallen
      result = validateScore(69, { passingScore: 70 });
      expect(result.passed).toBe(false);
    });

    test("Edge Cases: Genau an den Noten-Grenzwerten", () => {
      // Genau 90: A, 89: B, genau 80: B, 79: C, genau 70: C, 69: D, genau 60: D
      let result = validateScore(90);
      expect(result.grade).toBe("A");

      result = validateScore(89);
      expect(result.grade).toBe("B");

      result = validateScore(80);
      expect(result.grade).toBe("B");

      result = validateScore(79);
      expect(result.grade).toBe("C");

      result = validateScore(70);
      expect(result.grade).toBe("C");

      result = validateScore(69);
      expect(result.grade).toBe("D");

      result = validateScore(60);
      expect(result.grade).toBe("D");
    });
  });
});
