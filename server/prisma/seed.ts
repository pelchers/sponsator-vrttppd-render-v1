import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed existing data if needed
  
  // Seed chat roles and permissions
  await seedChatRolesAndPermissions();
  
  console.log('Database seeded successfully');
}

async function seedChatRolesAndPermissions() {
  console.log('Seeding chat roles and permissions...');
  
  // Create permissions
  const permissions = [
    { name: 'delete_chat', description: 'Can delete the entire chat' },
    { name: 'add_users', description: 'Can add new users to the chat' },
    { name: 'remove_users', description: 'Can remove users from the chat' },
    { name: 'change_roles', description: 'Can change the roles of other users' },
    { name: 'delete_messages', description: 'Can delete any message in the chat' },
    { name: 'edit_messages', description: 'Can edit any message in the chat' },
    { name: 'send_messages', description: 'Can send new messages' },
    { name: 'read_messages', description: 'Can read messages' },
    { name: 'send_media', description: 'Can send media attachments' },
    { name: 'pin_messages', description: 'Can pin messages to the top of the chat' },
  ];

  for (const perm of permissions) {
    await prisma.chat_permissions.upsert({
      where: { name: perm.name },
      update: perm,
      create: perm,
    });
  }

  // Create roles
  const roles = [
    { name: 'owner', description: 'Chat owner with full control' },
    { name: 'admin', description: 'Administrator with almost full control' },
    { name: 'moderator', description: 'Can moderate the chat and manage users' },
    { name: 'helper', description: 'Can help with basic moderation' },
    { name: 'chatter', description: 'Regular chat participant' },
    { name: 'spectator', description: 'Can only view messages' },
  ];

  for (const role of roles) {
    await prisma.chat_roles.upsert({
      where: { name: role.name },
      update: role,
      create: role,
    });
  }

  // Map roles to permissions
  const rolePermissions = {
    owner: [
      'delete_chat', 'add_users', 'remove_users', 'change_roles', 
      'delete_messages', 'edit_messages', 'send_messages', 
      'read_messages', 'send_media', 'pin_messages'
    ],
    admin: [
      'add_users', 'remove_users', 'change_roles', 
      'delete_messages', 'edit_messages', 'send_messages', 
      'read_messages', 'send_media', 'pin_messages'
    ],
    moderator: [
      'add_users', 'remove_users', 'change_roles', 
      'delete_messages', 'edit_messages', 'send_messages', 
      'read_messages', 'send_media', 'pin_messages'
    ],
    helper: [
      'add_users', 'delete_messages', 'send_messages', 
      'read_messages', 'send_media'
    ],
    chatter: [
      'send_messages', 'read_messages', 'send_media'
    ],
    spectator: [
      'read_messages'
    ]
  };

  for (const [roleName, permNames] of Object.entries(rolePermissions)) {
    const role = await prisma.chat_roles.findUnique({ where: { name: roleName } });
    
    for (const permName of permNames) {
      const perm = await prisma.chat_permissions.findUnique({ where: { name: permName } });
      
      if (role && perm) {
        await prisma.chat_role_permissions.upsert({
          where: {
            role_id_permission_id: {
              role_id: role.id,
              permission_id: perm.id
            }
          },
          update: {},
          create: {
            role_id: role.id,
            permission_id: perm.id
          }
        });
      }
    }
  }
  
  console.log('Chat roles and permissions seeded successfully');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 