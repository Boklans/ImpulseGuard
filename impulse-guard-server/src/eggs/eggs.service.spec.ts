jest.mock(
  'src/statistics/statistics.service',
  () => ({
    StatisticsService: class {},
  }),
  { virtual: true },
);
jest.mock(
  'src/pets/pets.service',
  () => ({
    PetsService: class {},
  }),
  { virtual: true },
);
jest.mock(
  'src/users/users.service',
  () => ({
    UsersService: class {},
  }),
  { virtual: true },
);
jest.mock(
  'src/notifications/notifications.service',
  () => ({
    NotificationsService: class {},
  }),
  { virtual: true },
);

import { EggsService } from './eggs.service';

function queryResult<T>(value: T) {
  return {
    exec: jest.fn(async () => value),
    then: (
      resolve: (value: T) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => Promise.resolve(value).then(resolve, reject),
  };
}

describe('EggsService evolution hatch', () => {
  it('hatches an egg into a staged pet and keeps existing rewards side effects', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const eggId = '507f1f77bcf86cd799439012';
    const ownerUserId = {
      _id: { toHexString: () => userId },
      toString: () => userId,
    };
    const egg = {
      _id: eggId,
      ownerUserId,
      rarity: 'legendary',
      isHatched: false,
      hatchStartTime: new Date('2026-01-01T00:00:00.000Z'),
      hatchEndTime: new Date('2026-01-01T00:00:00.000Z'),
    };
    const stagedPet = {
      _id: { toString: () => 'pet-1' },
      evolutionLine: 3,
      stage: 1,
      imageUrl: '9',
      toObject: () => ({
        _id: 'pet-1',
        evolutionLine: 3,
        stage: 1,
        imageUrl: '9',
      }),
    };

    class MockEggModel {
      static findOne = jest.fn(() => queryResult(egg));
      static deleteOne = jest.fn(async () => undefined);
    }

    const statisticsService = {
      update: jest.fn(async () => undefined),
    };
    const petsService = {
      create: jest.fn(async () => stagedPet),
    };
    const usersService = {
      increaseExperience: jest.fn(async () => ({ _id: 'user-1' })),
    };
    const notificationsService = {
      sendPushNotification: jest.fn(async () => undefined),
    };

    const service = new EggsService(
      MockEggModel as any,
      statisticsService as any,
      petsService as any,
      usersService as any,
      notificationsService as any,
    );

    const result = await service.finishHatch(eggId, userId);

    expect(petsService.create).toHaveBeenCalledWith({
      ownerUserId: userId,
      name: 'New Pet',
      rarity: 'legendary',
    });
    expect(statisticsService.update).toHaveBeenCalledWith({
      ownerUserId: userId,
      newEggsHatched: 1,
    });
    expect(MockEggModel.deleteOne).toHaveBeenCalledWith(eggId);
    expect(result).toMatchObject({
      _id: 'pet-1',
      evolutionLine: 3,
      stage: 1,
      imageUrl: '9',
      gainedXp: 50,
    });
  });
});
