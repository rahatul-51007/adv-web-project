import { Test, TestingModule } from '@nestjs/testing';
import { BorrowRequestsController } from './borrow-requests.controller';

describe('BorrowRequestsController', () => {
  let controller: BorrowRequestsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BorrowRequestsController],
    }).compile();

    controller = module.get<BorrowRequestsController>(BorrowRequestsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
