import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data in the correct order (respecting foreign keys)
  await prisma.reminder.deleteMany();
  await prisma.conversationMessage.deleteMany();
  await prisma.conversationSession.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.vaccination.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.consultation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create test users
  console.log("Creating test users...");

  // Pet Parent
  const petParent = await prisma.user.create({
    data: {
      email: "pet@example.com",
      name: "Priya Sharma",
      phone: "+919876543210",
      userType: "PET_OWNER",
    },
  });

  // Create profile for pet parent
  await prisma.profile.create({
    data: {
      userId: petParent.id,
      address: "123 Main St",
      city: "Pune",
      state: "Maharashtra",
      zipCode: "411001",
      country: "India",
      latitude: 18.5204,
      longitude: 73.8567,
    },
  });

  // Veterinarian 1
  const vet1 = await prisma.user.create({
    data: {
      email: "vet1@example.com",
      name: "Dr. Rajesh Mehta",
      phone: "+919876543212",
      userType: "VETERINARIAN",
    },
  });

  // Create profile for vet1
  await prisma.profile.create({
    data: {
      userId: vet1.id,
      address: "123 Clinic St",
      city: "Pune",
      state: "Maharashtra",
      zipCode: "411002",
      country: "India",
      latitude: 18.5204,
      longitude: 73.8567,
      licenseNumber: "VCI001",
      specialization: "Small Animal Medicine",
      yearsOfExperience: 10,
      bio: "Experienced in small animal medicine with 10+ years practice",
    },
  });

  // Veterinarian 2
  const vet2 = await prisma.user.create({
    data: {
      email: "vet2@example.com",
      name: "Dr. Anjali Deshmukh",
      phone: "+919876543213",
      userType: "VETERINARIAN",
    },
  });

  // Create profile for vet2
  await prisma.profile.create({
    data: {
      userId: vet2.id,
      address: "456 Central Ave",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      country: "India",
      latitude: 19.0761,
      longitude: 72.8724,
      licenseNumber: "VCI002",
      specialization: "Livestock Health",
      yearsOfExperience: 12,
      bio: "Specialist in livestock health management",
    },
  });

  // Create Pets for Pet Parent
  console.log("Creating pets...");

  const dog = await prisma.pet.create({
    data: {
      userId: petParent.id,
      name: "Max",
      type: "DOG",
      breed: "Golden Retriever",
      age: 24, // in months
      weight: 28,
      color: "Golden",
      image: "https://via.placeholder.com/400x300?text=Max",
    },
  });

  const cat = await prisma.pet.create({
    data: {
      userId: petParent.id,
      name: "Whiskers",
      type: "CAT",
      breed: "Persian",
      age: 12,
      weight: 4.5,
      color: "White",
      image: "https://via.placeholder.com/400x300?text=Whiskers",
    },
  });

  // Create Vaccination Records
  console.log("Creating vaccination records...");

  await prisma.vaccination.create({
    data: {
      petId: dog.id,
      name: "Rabies",
      date: new Date("2024-01-15"),
      expiryDate: new Date("2025-01-15"),
      veterinarian: "Dr. Rajesh Mehta",
    },
  });

  await prisma.vaccination.create({
    data: {
      petId: cat.id,
      name: "FVRCP",
      date: new Date("2024-02-01"),
      expiryDate: new Date("2025-02-01"),
      veterinarian: "Dr. Anjali Deshmukh",
    },
  });

  // Create Appointments
  console.log("Creating appointments...");

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      userId: petParent.id,
      petId: dog.id,
      title: "Checkup for Max",
      description: "General health checkup",
      status: "SCHEDULED",
      appointmentType: "CHECKUP",
      scheduledFor: tomorrow,
      duration: 30,
      veterinarian: "Dr. Rajesh Mehta",
      clinic: "PawsPoint Clinic",
      notes: "Initial checkup after vaccination",
    },
  });

  // Create Medical Records
  console.log("Creating medical records...");

  await prisma.medicalRecord.create({
    data: {
      petId: dog.id,
      type: "DIAGNOSIS",
      title: "Initial Health Assessment",
      description: "Pet is in good health condition",
      veterinarian: "Dr. Rajesh Mehta",
      clinic: "PawsPoint Clinic",
      diagnosis: "No issues detected",
      notes: "Continue regular feeding and exercise",
    },
  });

  // Create Medications
  console.log("Creating medications...");

  await prisma.medication.create({
    data: {
      petId: dog.id,
      name: "Amoxicillin",
      dosage: "250mg",
      frequency: "Twice daily",
      startDate: new Date("2024-03-01"),
      endDate: new Date("2024-03-14"),
      reason: "Infection treatment",
      sideEffects: "Mild nausea possible",
    },
  });

  // Create Conversation Sessions
  console.log("Creating conversation sessions...");

  const conversation = await prisma.conversationSession.create({
    data: {
      userId: petParent.id,
      title: "Max's health consultation",
      topic: "DOG",
    },
  });

  await prisma.conversationMessage.create({
    data: {
      sessionId: conversation.id,
      role: "USER",
      content: "My dog Max is having itching issues",
    },
  });

  await prisma.conversationMessage.create({
    data: {
      sessionId: conversation.id,
      role: "ASSISTANT",
      content:
        "Itching in dogs can be caused by allergies, parasites, or skin conditions. I recommend seeing a vet soon.",
    },
  });

  // Create Payments
  console.log("Creating payments...");

  await prisma.payment.create({
    data: {
      userId: petParent.id,
      amount: 500,
      currency: "USD",
      status: "COMPLETED",
      description: "Appointment payment",
    },
  });

  // Create Subscription
  console.log("Creating subscription...");

  await prisma.subscription.create({
    data: {
      userId: petParent.id,
      plan: "BASIC",
      status: "ACTIVE",
      startDate: new Date(),
      renewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
