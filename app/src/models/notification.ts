import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { JoinColumn } from 'typeorm';
import { Feed } from './feed';

@Entity()
@Unique(['feed_id', 'server_id'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  uuid!: string;

  @Column({ type: 'varchar', nullable: false })
  @ManyToOne(() => Feed, (feed) => feed.uuid)
  @JoinColumn({ name: 'feed_id' })
  feed_id!: string;

  @Column({ type: 'varchar', nullable: false })
  server_id!: string;

  @Column({ type: 'varchar', nullable: false })
  channel_id!: string;

  @Column({ type: 'varchar', nullable: false })
  webhook_url!: string;
}
