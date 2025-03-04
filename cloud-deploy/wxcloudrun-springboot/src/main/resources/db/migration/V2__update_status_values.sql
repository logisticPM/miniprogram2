-- 更新活动状态
UPDATE Activities SET status = 'in_progress' WHERE status = 'active';
UPDATE Activities SET status = 'not_started' WHERE status = 'pending';
UPDATE Activities SET status = 'ended' WHERE status = 'closed';

-- 更新房间状态
UPDATE Rooms SET status = 'available' WHERE status = 'available';
UPDATE Rooms SET status = 'grabbed' WHERE status = 'reserved';
UPDATE Rooms SET status = 'sold' WHERE status = 'sold';
