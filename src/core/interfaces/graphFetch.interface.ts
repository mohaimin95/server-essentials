import { FilterQuery, PipelineStage } from 'mongoose';

export default interface IGraphFetch {
  match?: FilterQuery<any> | undefined;
  project?: PipelineStage.Project;
}
