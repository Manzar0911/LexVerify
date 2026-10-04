import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { Task } from './entities/task.entity';
import { WorkflowLog } from './entities/workflow-log.entity';
import { VendorModule } from '../vendor/vendor.module';

@Module({
  imports: [TypeOrmModule.forFeature([Task, WorkflowLog]), VendorModule],
  controllers: [WorkflowController],
  providers: [WorkflowService],
  exports: [WorkflowService],
})
export class WorkflowModule {}
