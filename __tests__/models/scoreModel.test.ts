
// __esModule: true tells ts-jest this is a default-export module; without it,
// esModuleInterop won't wire up the default import and pool resolves to undefined.
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

//This two imports were from original file
//import pool from '../../config/database';
//import { uploadScore, pullTop10OfUser, pullTop10OfCity, getPersonalBest, pullTop10Total } from '../../models/scoreModel';

//The two imports below so it can work on Joauna Carter's windows
import pool from '../../config/database.js';
import { uploadScore, pullTop10OfUser, pullTop10OfCity, getPersonalBest, pullTop10Total } from '../../models/scoreModel.js';

const mockQuery = pool.query as jest.Mock;

const fakeEntry = (overrides = {}) => ({
  scoreId: 1, userId: 10, cityId: 2, correctCount: 8, score: 5000, timeCompleted: 15000, isPublic: true,
  ...overrides,
} as any);

beforeEach(() => mockQuery.mockReset());

// mysql2 returns [ResultSetHeader|RowDataPacket[], FieldPacket[]] — the models always
// take [0], so mock responses must be wrapped in an outer array to mirror that shape.
describe('uploadScore', () => {
  it('returns true when UPDATE affects a row (new score is higher)', async () => {
    mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await uploadScore(fakeEntry({ score: 9000 }));

    expect(result).toBe(true);
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it('returns false when a row exists but the new score is not higher', async () => {
    // UPDATE affects 0 rows, then SELECT finds existing row
    mockQuery
      .mockResolvedValueOnce([{ affectedRows: 0 }])
      .mockResolvedValueOnce([[{ scoreId: 1 }]]);

    const result = await uploadScore(fakeEntry({ score: 1000 }));

    expect(result).toBe(false);
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  it('inserts a new row and returns true when no existing score exists', async () => {
    // UPDATE affects 0 rows, SELECT finds no existing row, INSERT succeeds
    mockQuery
      .mockResolvedValueOnce([{ affectedRows: 0 }])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const result = await uploadScore(fakeEntry());

    expect(result).toBe(true);
    expect(mockQuery).toHaveBeenCalledTimes(3);
  });

  it('returns false when INSERT affects 0 rows', async () => {
    mockQuery
      .mockResolvedValueOnce([{ affectedRows: 0 }])
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ affectedRows: 0 }]);

    const result = await uploadScore(fakeEntry());

    expect(result).toBe(false);
  });
});

describe('pullTop10OfUser', () => {
  it('returns the array of score entries for a user', async () => {
    const entries = [fakeEntry(), fakeEntry({ score: 3000 })];
    mockQuery.mockResolvedValueOnce([entries]);

    const result = await pullTop10OfUser(10);

    expect(result).toEqual(entries);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE userId = ?'),
      [10]
    );
  });

  it('returns an empty array when the user has no scores', async () => {
    mockQuery.mockResolvedValueOnce([[]]);

    const result = await pullTop10OfUser(999);

    expect(result).toEqual([]);
  });
});

describe('pullTop10OfCity', () => {
  it('returns the top 10 public scores for a city', async () => {
    const entries = [fakeEntry()];
    mockQuery.mockResolvedValueOnce([entries]);

    const result = await pullTop10OfCity(2);

    expect(result).toEqual(entries);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE cityId = ?'),
      [2]
    );
  });
});

describe('getPersonalBest', () => {
  it('returns the personal best entry for a user and city', async () => {
    const entry = fakeEntry();
    mockQuery.mockResolvedValueOnce([[entry]]);

    const result = await getPersonalBest(10, 2);

    expect(result).toEqual(entry);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('WHERE userId = ? AND cityId = ?'),
      [10, 2]
    );
  });
});

describe('pullTop10Total', () => {
  it('returns the global top 10 scores', async () => {
    const entries = [fakeEntry()];
    mockQuery.mockResolvedValueOnce([entries]);

    const result = await pullTop10Total();

    expect(result).toEqual(entries);
  });
});
