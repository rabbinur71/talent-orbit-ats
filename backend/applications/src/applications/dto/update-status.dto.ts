import { IsIn } from 'class-validator';

export class UpdateStatusDto {
  @IsIn(['APPLIED', 'SCREENED', 'INTERVIEWED', 'OFFERED', 'HIRED', 'REJECTED'])
  status!:
    | 'APPLIED'
    | 'SCREENED'
    | 'INTERVIEWED'
    | 'OFFERED'
    | 'HIRED'
    | 'REJECTED';
}
