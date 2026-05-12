/// <reference types="jest" />
import { supply10FromCityAndPersonalBest, getTop10OfUser, homePage } from '../../controllers/scoreController.js';

jest.mock('../../models/scoreModel.js');
jest.mock('../../models/userModel.js');
jest.mock('../../models/cityModel.js');

import * as scoreModel from '../../models/scoreModel.js';
import { findUserById } from '../../models/userModel.js';
import { getCityById } from '../../models/cityModel.js';

const mockPullTop10OfCity = scoreModel.pullTop10OfCity as jest.MockedFunction<typeof scoreModel.pullTop10OfCity>;
const mockPullTop10OfUser = scoreModel.pullTop10OfUser as jest.MockedFunction<typeof scoreModel.pullTop10OfUser>;
const mockPullTop10Total = scoreModel.pullTop10Total as jest.MockedFunction<typeof scoreModel.pullTop10Total>;
const mockGetPersonalBest = scoreModel.getPersonalBest as jest.MockedFunction<typeof scoreModel.getPersonalBest>;
const mockFindUserById = findUserById as jest.MockedFunction<typeof findUserById>;
const mockGetCityById = getCityById as jest.MockedFunction<typeof getCityById>;

function makeReq(overrides: Record<string, unknown> = {}): any {
  return { params: {}, session: {}, ...overrides };
}

function makeRes(): any {
  return { render: jest.fn(), redirect: jest.fn() };
}

const fakeEntry = (overrides = {}) => ({
  scoreId: 1, userId: 10, cityId: 2, correctCount: 8, score: 5000, timeCompleted: 15000, isPublic: true,
  ...overrides,
} as any);

// convertScoreEntryToScore (called internally by all three exports) always hits
// findUserById and getCityById, so stub them once here for every test.
beforeEach(() => {
  jest.clearAllMocks();
  mockFindUserById.mockResolvedValue({ userId: 10, username: 'alice' } as any);
  mockGetCityById.mockResolvedValue({ cityId: 2, cityName: 'Rome' } as any);
});

describe('supply10FromCityAndPersonalBest', () => {
  it('renders leaderboard with top 10 scores and city name', async () => {
    const req = makeReq({ params: { id: '2' }, session: {} });
    const res = makeRes();

    mockPullTop10OfCity.mockResolvedValue([fakeEntry()]);
    mockGetPersonalBest.mockResolvedValue(fakeEntry());

    await supply10FromCityAndPersonalBest(req, res);

    expect(res.render).toHaveBeenCalledWith('leaderboardTemplate', {
      scores: [{ userId: 10, username: 'alice', correctCount: 8, score: 5000, cityName: 'Rome' }],
      cityName: 'Rome',
      personalBest: undefined,
    });
  });

  it('includes personalBest when user is logged in', async () => {
    const req = makeReq({ params: { id: '2' }, session: { userId: 10 } });
    const res = makeRes();
    const best = fakeEntry({ score: 9000 });

    mockPullTop10OfCity.mockResolvedValue([]);
    mockGetPersonalBest.mockResolvedValue(best);

    await supply10FromCityAndPersonalBest(req, res);

    expect(mockGetPersonalBest).toHaveBeenCalledWith(10, 2);
    expect(res.render).toHaveBeenCalledWith(
      'leaderboardTemplate',
      expect.objectContaining({ personalBest: best })
    );
  });

  it('does not fetch personalBest for guest users', async () => {
    const req = makeReq({ params: { id: '2' }, session: {} });
    const res = makeRes();

    mockPullTop10OfCity.mockResolvedValue([]);

    await supply10FromCityAndPersonalBest(req, res);

    expect(mockGetPersonalBest).not.toHaveBeenCalled();
  });
});

describe('getTop10OfUser', () => {
  it('returns an array of Score objects for a given user', async () => {
    mockPullTop10OfUser.mockResolvedValue([fakeEntry(), fakeEntry({ score: 3000, correctCount: 5 })]);

    const result = await getTop10OfUser(10);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ userId: 10, username: 'alice', correctCount: 8, score: 5000, cityName: 'Rome' });
    expect(result[1]).toEqual({ userId: 10, username: 'alice', correctCount: 5, score: 3000, cityName: 'Rome' });
  });

  it('returns an empty array when the user has no scores', async () => {
    mockPullTop10OfUser.mockResolvedValue([]);

    const result = await getTop10OfUser(99);

    expect(result).toEqual([]);
  });
});

describe('homePage', () => {
  it('renders home with the global top 10 scores', async () => {
    const req = makeReq();
    const res = makeRes();

    mockPullTop10Total.mockResolvedValue([fakeEntry()]);

    await homePage(req, res);

    expect(res.render).toHaveBeenCalledWith('home', {
      scores: [{ userId: 10, username: 'alice', correctCount: 8, score: 5000, cityName: 'Rome' }],
    });
  });

  it('renders home with an empty scores list when no scores exist', async () => {
    const req = makeReq();
    const res = makeRes();

    mockPullTop10Total.mockResolvedValue([]);

    await homePage(req, res);

    expect(res.render).toHaveBeenCalledWith('home', { scores: [] });
  });
});
