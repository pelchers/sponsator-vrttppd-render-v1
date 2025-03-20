-- First ensure featured fields exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'featured') THEN
        ALTER TABLE "users" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Then handle image fields
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'profile_image_url') THEN
        ALTER TABLE "users" ADD COLUMN "profile_image_url" TEXT;
    END IF;
END $$;

-- ... (similar blocks for other tables) 