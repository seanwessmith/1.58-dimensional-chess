import { describe, expect, test } from "bun:test";
import {
  isLegalMoveBishop,
  isLegalMovePawn,
  isLegalMoveQueen,
} from "./legality";

const ACTIVE_SQUARES = [
  "a1",
  "a2",
  "a3",
  "a4",
  "a5",
  "a6",
  "a7",
  "a8",
  "b2",
  "b4",
  "b6",
  "b8",
  "c3",
  "c4",
  "c7",
  "c8",
  "d4",
  "d8",
  "e5",
  "e6",
  "e7",
  "e8",
  "f6",
  "f8",
  "g7",
  "g8",
  "h8",
];

describe("legality", () => {
  test("queen can move on both diagonal directions", () => {
    expect(
      isLegalMoveQueen(
        ACTIVE_SQUARES,
        { a3: "Q" },
        "white",
        "a3",
        "b4"
      )
    ).toBe(true);

    expect(
      isLegalMoveQueen(
        ACTIVE_SQUARES,
        { c3: "Q" },
        "white",
        "c3",
        "b4"
      )
    ).toBe(true);
  });

  test("pawns use distinct move and capture rules for each color", () => {
    expect(
      isLegalMovePawn(
        ACTIVE_SQUARES,
        { c3: "P" },
        "white",
        "c3",
        "c4"
      )
    ).toBe(true);

    expect(
      isLegalMovePawn(
        ACTIVE_SQUARES,
        { c3: "P", b4: "p" },
        "white",
        "c3",
        "b4"
      )
    ).toBe(true);

    expect(
      isLegalMovePawn(
        ACTIVE_SQUARES,
        { e7: "p" },
        "black",
        "e7",
        "d7"
      )
    ).toBe(false);

    expect(
      isLegalMovePawn(
        ACTIVE_SQUARES,
        { e7: "p", d8: "P" },
        "black",
        "e7",
        "d8"
      )
    ).toBe(true);
  });

  test("bishops cannot move through covered squares", () => {
    expect(
      isLegalMoveBishop(
        ACTIVE_SQUARES,
        { a2: "B" },
        "white",
        "a2",
        "d5"
      )
    ).toBe(false);
  });
});
