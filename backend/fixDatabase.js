import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const fixDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the database
    const db = mongoose.connection.db;
    
    // Drop conflicting indexes from old collections
    const collections = ['users', 'users_tripmate', 'carpool', 'carpool_tripmate', 'vehicles', 'vehicles_tripmate', 'bookings', 'bookings_tripmate', 'user_ratings_tripmate'];
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        
        // Try to drop potentially conflicting indexes
        const indexesToDrop = [
          'flatNumber_1_apartment_1',
          'flatNumber_1',
          'apartment_1'
        ];
        
        for (const indexName of indexesToDrop) {
          try {
            await collection.dropIndex(indexName);
            console.log(`✅ Dropped index: ${indexName} from ${collectionName}`);
          } catch (error) {
            // Index doesn't exist, that's fine
          }
        }
        
        // List current indexes for this collection
        const indexes = await collection.indexes();
        if (indexes.length > 0) {
          console.log(`\n📋 Current indexes on ${collectionName} collection:`);
          indexes.forEach(index => {
            console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
          });
        }
        
      } catch (error) {
        console.log(`ℹ️  Collection ${collectionName} not found or not accessible`);
      }
    }

    console.log('\n✅ Database indexes fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the fix
fixDatabase();
