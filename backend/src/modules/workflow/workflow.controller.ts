import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { WorkflowService } from './workflow.service';
import { UpdateWorkflowStatusDto } from './dto/update-workflow-status.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { VendorStatus } from '../vendor/entities/vendor-status.enum';
import { Task } from './entities/task.entity';
import { WorkflowLog } from './entities/workflow-log.entity';

@ApiTags('Workflow')
@Controller()
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Put('vendors/:vendorId/workflow/status')
  @ApiOperation({ summary: 'Update vendor workflow status' })
  @ApiParam({ name: 'vendorId', type: 'string', format: 'uuid' })
  async updateStatus(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
    @Body() dto: UpdateWorkflowStatusDto,
  ): Promise<{ status: VendorStatus }> {
    const status = await this.workflowService.transitionStatus(vendorId, dto);
    return { status };
  }

  @Get('vendors/:vendorId/workflow/logs')
  @ApiOperation({ summary: 'Get workflow audit logs for a vendor' })
  @ApiParam({ name: 'vendorId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: [WorkflowLog] })
  async getLogs(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
  ): Promise<WorkflowLog[]> {
    return this.workflowService.getWorkflowLogs(vendorId);
  }

  @Get('vendors/:vendorId/tasks')
  @ApiOperation({ summary: 'Get all tasks for a vendor' })
  @ApiParam({ name: 'vendorId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: [Task] })
  async getTasks(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
  ): Promise<Task[]> {
    return this.workflowService.getTasks(vendorId);
  }

  @Post('vendors/:vendorId/tasks')
  @ApiOperation({ summary: 'Create a task for a vendor' })
  @ApiParam({ name: 'vendorId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 201, type: Task })
  async createTask(
    @Param('vendorId', ParseUUIDPipe) vendorId: string,
    @Body() dto: CreateTaskDto,
  ): Promise<Task> {
    return this.workflowService.createTask(vendorId, dto);
  }

  @Put('tasks/:taskId')
  @ApiOperation({ summary: 'Update a task' })
  @ApiParam({ name: 'taskId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, type: Task })
  async updateTask(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    return this.workflowService.updateTask(taskId, dto);
  }
}
