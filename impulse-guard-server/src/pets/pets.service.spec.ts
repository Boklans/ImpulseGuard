import { Types } from 'mongoose';

jest.mock(
  'src/users/users.service',
  () => ({
    UsersService: class {},
  }),
  { virtual: true },
);

import { PetsService } from './pets.service';

type MockPet = Record<string, any> & { save: jest.Mock };

const docs = new Map<string, MockPet>();

function queryResult<T>(value: T) {
  return {
    exec: jest.fn(async () => value),
    then: (
      resolve: (value: T) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => Promise.resolve(value).then(resolve, reject),
  };
}

function makePet(data: Record<string, any>): MockPet {
  const id = data._id?.toString?.() ?? new Types.ObjectId().toHexString();
  const pet: MockPet = {
    _id: id,
    maxHealth: 100,
    currentHealth: 100,
    maxEnergy: 10,
    currentEnergy: 10,
    isActive: true,
    friendship: 1,
    currentFriendshipXp: 0,
    currentXP: 0,
    level: 1,
    xpForNextLevel: 100,
    imageUrl: '1',
    ...data,
    save: jest.fn(async function save(this: MockPet) {
      docs.set(id, this);
      return this;
    }),
  };
  docs.set(id, pet);
  return pet;
}

class MockPetModel {
  constructor(data: Record<string, any>) {
    return makePet(data);
  }

  static findById(id: string) {
    return queryResult(docs.get(id) ?? null);
  }

  static find(_filter: Record<string, any>) {
    return {
      sort: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      exec: jest.fn(async () => Array.from(docs.values())),
    };
  }

  static countDocuments() {
    return docs.size;
  }
}

describe('PetsService evolution', () => {
  let service: PetsService;

  beforeEach(() => {
    docs.clear();
    jest.spyOn(Math, 'random').mockReturnValue(0);
    service = new PetsService(MockPetModel as any, {} as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a new pet at stage 1 with the first image for its line', async () => {
    const pet = await service.create({
      ownerUserId: new Types.ObjectId().toHexString(),
      name: 'New Pet',
    });

    expect(pet.evolutionLine).toBe(1);
    expect(pet.stage).toBe(1);
    expect(pet.imageUrl).toBe('1');
  });

  it('evolves through stages as XP raises pet level', async () => {
    const pet = makePet({
      _id: 'pet-1',
      ownerUserId: new Types.ObjectId(),
      evolutionLine: 1,
      stage: 1,
      imageUrl: '1',
    });

    await service.increaseExperience(pet._id, 2000);
    expect(pet.level).toBe(5);
    expect(pet.stage).toBe(2);
    expect(pet.imageUrl).toBe('2');

    await service.increaseExperience(pet._id, 14500);
    expect(pet.level).toBe(10);
    expect(pet.stage).toBe(3);
    expect(pet.imageUrl).toBe('3');

    await service.increaseExperience(pet._id, 116500);
    expect(pet.level).toBe(20);
    expect(pet.stage).toBe(4);
    expect(pet.imageUrl).toBe('4');
  });

  it('backfills existing pets from image and current level', async () => {
    const pet = makePet({
      _id: 'legacy-pet',
      ownerUserId: new Types.ObjectId(),
      imageUrl: '7',
      level: 10,
      evolutionLine: undefined,
      stage: undefined,
    });

    const result = await service.findOne(pet._id);

    expect(result.evolutionLine).toBe(2);
    expect(result.stage).toBe(3);
    expect(result.imageUrl).toBe('7');
    expect(result.save).toHaveBeenCalled();
  });

  it('updates evolution during session completion', async () => {
    const pet = makePet({
      _id: 'session-pet',
      ownerUserId: new Types.ObjectId(),
      evolutionLine: 2,
      stage: 1,
      imageUrl: '5',
    });

    await service.updateAfterSession(pet._id, 2000, 0, 0);

    expect(pet.level).toBe(5);
    expect(pet.stage).toBe(2);
    expect(pet.imageUrl).toBe('6');
  });
});
