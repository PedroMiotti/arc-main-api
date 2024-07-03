import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const seedAuth = async () => {
  const adminUserType = await prisma.userType.create({
    data: {
      Description: 'Admin',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.userType.create({
    data: {
      Description: 'Owner',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.userType.create({
    data: {
      Description: 'Member',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.userType.create({
    data: {
      Description: 'Client',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.invitationStatus.create({
    data: {
      Description: 'Not sent',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.invitationStatus.create({
    data: {
      Description: 'Pending',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.invitationStatus.create({
    data: {
      Description: 'Sent',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.invitationStatus.create({
    data: {
      Description: 'Accepted',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.user.create({
    data: {
      Email: 'admin@archie.com.br',
      Password: '$2b$10$/nKMOs2Sozx5AH4OHQyUxe8j9dE7HF5uLk2PESYFcceP6kpFjb.M2',
      Document: '123456789',
      DocumentType: 'CPF',
      Phone: '11999999999',
      Name: 'Admin Archie',
      IsActive: true,
      UserTypeId: adminUserType.Id,
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });
};

const seedProject = async () => {
  await prisma.projectCategory.create({
    data: {
      Description: 'Residencial',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.projectCategory.create({
    data: {
      Description: 'Comercial',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.projectCategory.create({
    data: {
      Description: 'Industrial',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.projectCategory.create({
    data: {
      Description: 'Hospitalar',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.boardStatusType.create({
    data: {
      Description: 'Pending',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.boardStatusType.create({
    data: {
      Description: 'In Progress',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.boardStatusType.create({
    data: {
      Description: 'Done',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.boardStatusType.create({
    data: {
      Description: 'Canceled',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.phaseColor.create({
    data: {
      Description: 'Light Purple',
      Color: '#9f8fef',
      BackgroundColor: '#f0f0f0',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.phaseColor.create({
    data: {
      Description: 'Dark Purple',
      Color: '#6e5dc6',
      BackgroundColor: '#f0f0f0',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.phaseColor.create({
    data: {
      Description: 'Light Blue',
      Color: '#579dff',
      BackgroundColor: '#f0f0f0',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.phaseColor.create({
    data: {
      Description: 'Dark Blue',
      Color: '#0c66e4',
      BackgroundColor: '#f0f0f0',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.phaseColor.create({
    data: {
      Description: 'Light Green',
      Color: '#4bce97',
      BackgroundColor: '#f0f0f0',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.phaseColor.create({
    data: {
      Description: 'Dark Green',
      Color: '#1f845a',
      BackgroundColor: '#f0f0f0',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.phaseColor.create({
    data: {
      Description: 'Light BlueGreen',
      Color: '#6cc3e0',
      BackgroundColor: '#f0f0f0',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.phaseColor.create({
    data: {
      Description: 'Dark BlueGreen',
      Color: '#227d9b',
      BackgroundColor: '#f0f0f0',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.phaseColor.create({
    data: {
      Description: 'Light Yellow',
      Color: '#f5cd47',
      BackgroundColor: '#f0f0f0',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.phaseColor.create({
    data: {
      Description: 'Dark Yellow',
      Color: '#c25100',
      BackgroundColor: '#f0f0f0',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.phaseColor.create({
    data: {
      Description: 'Light Red',
      Color: '#f87168',
      BackgroundColor: '#f0f0f0',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.phaseColor.create({
    data: {
      Description: 'Dark Red',
      Color: '#c9372c',
      BackgroundColor: '#f0f0f0',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.phaseColor.create({
    data: {
      Description: 'Light Gray',
      Color: '#8590a2',
      BackgroundColor: '#f0f0f0',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.phaseColor.create({
    data: {
      Description: 'Dark Gray',
      Color: '#626f86',
      BackgroundColor: '#f0f0f0',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });
};

const seedSchedule = async () => {
  await prisma.eventType.create({
    data: {
      Description: 'Event',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.eventType.create({
    data: {
      Description: 'Absence',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.scheduleEventStatus.create({
    data: {
      Description: 'Pending',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.scheduleEventStatus.create({
    data: {
      Description: 'Rejected',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.scheduleEventStatus.create({
    data: {
      Description: 'Accepted',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });
};

const seedDrive = async () => {
  await prisma.accessLevel.create({
    data: {
      Description: 'Read',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.accessLevel.create({
    data: {
      Description: 'Write',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.accessLevel.create({
    data: {
      Description: 'Delete',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.accessLevel.create({
    data: {
      Description: 'Move',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });

  await prisma.accessLevel.create({
    data: {
      Description: 'Share',
      CreatedAt: new Date(),
      UpdatedAt: new Date(),
    },
  });
};

async function main() {
  await seedAuth();
  await seedProject();
  await seedSchedule();
  await seedDrive();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
