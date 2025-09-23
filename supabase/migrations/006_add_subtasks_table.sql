-- Add subtasks table for breaking down assignments into manageable pieces
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  order_position INTEGER NOT NULL DEFAULT 0,
  est_minutes INTEGER CHECK (est_minutes > 0),
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_subtasks_assignment ON subtasks(assignment_id);
CREATE INDEX idx_subtasks_order ON subtasks(assignment_id, order_position);

-- Add RLS for privacy (users can only access subtasks of their own assignments)
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage subtasks of their assignments" ON subtasks
  FOR ALL USING (
    auth.uid() = (
      SELECT user_id FROM assignments WHERE id = assignment_id
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_subtasks_updated_at BEFORE UPDATE ON subtasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add helpful comments
COMMENT ON TABLE subtasks IS 'Subtasks for breaking down assignments into smaller manageable pieces';
COMMENT ON COLUMN subtasks.assignment_id IS 'Reference to the parent assignment';
COMMENT ON COLUMN subtasks.title IS 'Brief description of the subtask';
COMMENT ON COLUMN subtasks.completed IS 'Whether this subtask has been completed';
COMMENT ON COLUMN subtasks.order_position IS 'Order of subtask within the assignment (0 = first)';
COMMENT ON COLUMN subtasks.est_minutes IS 'Estimated time to complete this subtask in minutes';
COMMENT ON COLUMN subtasks.due_at IS 'Optional due date for this specific subtask';