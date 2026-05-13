import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.availabilitySlot.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.triageMessage.deleteMany();
  await prisma.triageSession.deleteMany();
  await prisma.vaccination.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.milkYieldLog.deleteMany();
  await prisma.farmProfile.deleteMany();
  await prisma.vetProfile.deleteMany();
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
      role: "PET_PARENT",
      state: "Maharashtra",
      district: "Pune",
      pincode: "411001",
      language: "en",
    },
  });

  // Dairy Farmer
  const dairyFarmer = await prisma.user.create({
    data: {
      email: "farmer@example.com",
      name: "Dilip Patil",
      phone: "+919876543211",
      role: "DAIRY_FARMER",
      state: "Maharashtra",
      district: "Pune",
      language: "hi",
    },
  });

  // Vet Doctors
  const vet1 = await prisma.user.create({
    data: {
      email: "vet1@example.com",
      name: "Dr. Rajesh Mehta",
      phone: "+919876543212",
      role: "VET_DOCTOR",
      state: "Maharashtra",
      district: "Pune",
      language: "en",
    },
  });

  const vet2 = await prisma.user.create({
    data: {
      email: "vet2@example.com",
      name: "Dr. Anjali Deshmukh",
      phone: "+919876543213",
      role: "VET_DOCTOR",
      state: "Maharashtra",
      district: "Mumbai",
      language: "en",
    },
  });

  const vet3 = await prisma.user.create({
    data: {
      email: "vet3@example.com",
      name: "Dr. Suresh Wagh",
      phone: "+919876543214",
      role: "VET_DOCTOR",
      state: "Maharashtra",
      district: "Nagpur",
      language: "en",
    },
  });

  // Create Vet Profiles
  console.log("Creating vet profiles...");

  const vetProfile1 = await prisma.vetProfile.create({
    data: {
      userId: vet1.id,
      vciNumber: "VCI001",
      clinicName: "PawsPoint Clinic",
      clinicAddress: "123 Main St, Pune",
      latitude: 18.5204,
      longitude: 73.8567,
      specialisations: ["Dogs", "Cats", "General"],
      consultFeeOnline: 299,
      consultFeeVisit: 500,
      isVerified: true,
      isAvailable: true,
      rating: 4.5,
      totalRatings: 128,
      bio: "Experienced in small animal medicine with 10+ years practice",
    },
  });

  const vetProfile2 = await prisma.vetProfile.create({
    data: {
      userId: vet2.id,
      vciNumber: "VCI002",
      clinicName: "VetCare Mumbai",
      clinicAddress: "456 Central Ave, Mumbai",
      latitude: 19.0761,
      longitude: 72.8724,
      specialisations: ["Cattle", "Buffalo", "General"],
      consultFeeOnline: 349,
      consultFeeVisit: 600,
      isVerified: true,
      isAvailable: true,
      rating: 4.8,
      totalRatings: 256,
      bio: "Specialist in livestock health management",
    },
  });

  const vetProfile3 = await prisma.vetProfile.create({
    data: {
      userId: vet3.id,
      vciNumber: "VCI003",
      clinicName: "All-in-One Veterinary",
      clinicAddress: "789 Ramdaspeth, Nagpur",
      latitude: 21.1458,
      longitude: 79.0882,
      specialisations: ["All Animals"],
      consultFeeOnline: 249,
      consultFeeVisit: 450,
      isVerified: true,
      isAvailable: true,
      rating: 4.3,
      totalRatings: 94,
      bio: "Rural veterinary services with mobile clinic",
    },
  });

  // Create Availability Slots
  console.log("Creating availability slots...");

  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    for (let vp of [vetProfile1, vetProfile2, vetProfile3]) {
      // Morning slots
      await prisma.availabilitySlot.create({
        data: {
          vetId: vp.id,
          date,
          startTime: "09:00",
          endTime: "09:30",
          isBooked: Math.random() > 0.5,
        },
      });

      // Afternoon slots
      await prisma.availabilitySlot.create({
        data: {
          vetId: vp.id,
          date,
          startTime: "14:00",
          endTime: "14:30",
          isBooked: Math.random() > 0.5,
        },
      });

      // Evening slots
      await prisma.availabilitySlot.create({
        data: {
          vetId: vp.id,
          date,
          startTime: "18:00",
          endTime: "18:30",
          isBooked: Math.random() > 0.5,
        },
      });
    }
  }

  // Create Farm Profile
  console.log("Creating farm profile...");

  await prisma.farmProfile.create({
    data: {
      userId: dairyFarmer.id,
      farmName: "Patil Dairy Farm",
      farmSize: "5 acres",
      herdSize: 25,
      district: "Pune",
      state: "Maharashtra",
      latitude: 18.4386,
      longitude: 73.9006,
    },
  });

  // Create Animals for Pet Parent
  console.log("Creating animals...");

  const dog = await prisma.animal.create({
    data: {
      userId: petParent.id,
      name: "Max",
      species: "Dog",
      breed: "Golden Retriever",
      ageMonths: 24,
      weightKg: 28,
    },
  });

  const cat = await prisma.animal.create({
    data: {
      userId: petParent.id,
      name: "Whiskers",
      species: "Cat",
      breed: "Persian",
      ageMonths: 12,
      weightKg: 4.5,
    },
  });

  // Create Triage Session
  console.log("Creating triage session...");

  const triageSession = await prisma.triageSession.create({
    data: {
      userId: petParent.id,
      animalId: dog.id,
      species: "Dog",
      symptoms: "Itching, scratching, red patches on skin",
      severity: "amber",
      aiResponse: {
        severity: "amber",
        severityReason: "Could indicate allergies or dermatitis",
        possibleConditions: [
          { name: "Allergic Dermatitis", likelihood: "high", reason: "Itching and patches suggest allergy" },
          { name: "Fungal Infection", likelihood: "medium", reason: "Symptoms could indicate fungal issue" },
        ],
        explanation: "Based on the symptoms, your pet may have allergies or a skin infection. Monitor closely.",
        immediateSteps: ["Apply cool compress", "Bathe with mild shampoo"],
        doNotDo: ["Do not use hot water", "Avoid harsh chemicals"],
        needsVet: true,
        urgency: "See vet within 48 hours",
        isZoonotic: false,
      },
      source: "ai",
    },
  });

  // Create Vaccination Records
  console.log("Creating vaccination records...");

  await prisma.vaccination.create({
    data: {
      animalId: dog.id,
      vaccineName: "Rabies",
      dateGiven: new Date("2024-01-15"),
      nextDue: new Date("2025-01-15"),
      givenBy: "Dr. Rajesh Mehta",
    },
  });

  await prisma.vaccination.create({
    data: {
      animalId: dog.id,
      vaccineName: "DHPP",
      dateGiven: new Date("2024-02-15"),
      nextDue: new Date("2025-02-15"),
      givenBy: "Dr. Rajesh Mehta",
    },
  });

  // Create Milk Yield Logs
  console.log("Creating milk yield logs...");

  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    await prisma.milkYieldLog.create({
      data: {
        farmId: (await prisma.farmProfile.findFirst({ where: { userId: dairyFarmer.id } }))!.id,
        date,
        morningLitres: 15 + Math.random() * 5,
        eveningLitres: 12 + Math.random() * 5,
        notes: "Regular production",
      },
    });
  }

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
