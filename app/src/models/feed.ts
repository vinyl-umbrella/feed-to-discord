import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Feed {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column({ type: 'varchar', nullable: false, unique: true })
  feed_url!: string;

  @Column({
    type: 'datetime',
    nullable: false,
    default: () => 'now()',
  })
  last_updated_at!: Date;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
  })
  is_active!: boolean;
}
