import { Test, TestingModule } from '@nestjs/testing';
import { ReturnRequestsController } from './return-requests.controller';

describe('ReturnRequestsController', () => {
  let controller: ReturnRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReturnRequestsController],
    }).compile();

    controller = module.get<ReturnRequestsController>(ReturnRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
