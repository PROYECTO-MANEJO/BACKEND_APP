/**
 * User Repository Implementation - Infrastructure Layer
 *
 * Implementación simplificada que funciona con el esquema Prisma real
 * Maneja operaciones básicas de usuario según la estructura existente
 */

import { PrismaClient } from "@prisma/client";
import { User } from "../../domain/entities/User";
import { IUserRepository, UserFilters } from "../../domain/repositories/IUserRepository";

export interface UserData {
  id?: string;
  cedula: string;
  firstName: string;
  secondName?: string;
  lastName: string;
  secondLastName?: string;
  dateOfBirth: Date;
  phoneNumber?: string;
  password?: string;
  careerId?: string;
  githubToken?: string;
  githubUsername?: string;
}

export interface UserProfileData {
  id_usu: string;
  ced_usu: string;
  nom_usu1: string;
  nom_usu2?: string;
  ape_usu1: string;
  ape_usu2?: string;
  fec_nac_usu: Date;
  num_tel_usu?: string;
  id_car_per?: string;
  github_token?: string;
  github_username?: string;
  email?: string;
  rol?: string;
  carrera?: {
    id_car: string;
    nom_car: string;
  };
  cuentas?: any[];
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async create(userData: UserData): Promise<UserData> {
    const usuario = await this.prisma.usuario.create({
      data: {
        ced_usu: userData.cedula,
        nom_usu1: userData.firstName,
        nom_usu2: userData.secondName || "",
        ape_usu1: userData.lastName,
        ape_usu2: userData.secondLastName || "",
        fec_nac_usu: userData.dateOfBirth,
        num_tel_usu: userData.phoneNumber || null,
        pas_usu: userData.password || null,
        id_car_per: userData.careerId || null,
        github_token: userData.githubToken || null,
        github_username: userData.githubUsername || null,
      },
      include: {
        carrera: true,
      },
    });

    return this.mapToUserData(usuario);
  }

  async findByCedula(cedula: string): Promise<UserData | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { ced_usu: cedula },
      include: {
        carrera: true,
        cuentas: true,
      },
    });

    if (!usuario) return null;
    return this.mapToUserData(usuario);
  }

  async findById(id: string): Promise<UserData | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usu: id },
      include: {
        carrera: true,
        cuentas: true,
      },
    });

    if (!usuario) return null;
    return this.mapToUserData(usuario);
  }

  async findProfileById(id: string): Promise<UserProfileData | null> {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id_usu: id },
      include: {
        carrera: true,
        cuentas: true,
      },
    });

    if (!usuario) return null;
    
    const account = usuario.cuentas[0];
    
    return {
      id_usu: usuario.id_usu,
      ced_usu: usuario.ced_usu,
      nom_usu1: usuario.nom_usu1,
      nom_usu2: usuario.nom_usu2,
      ape_usu1: usuario.ape_usu1,
      ape_usu2: usuario.ape_usu2,
      fec_nac_usu: usuario.fec_nac_usu,
      num_tel_usu: usuario.num_tel_usu || undefined,
      id_car_per: usuario.id_car_per || undefined,
      github_token: usuario.github_token || undefined,
      github_username: usuario.github_username || undefined,
      email: account?.cor_cue,
      rol: account?.rol_cue,
      carrera: usuario.carrera
        ? { id_car: usuario.carrera.id_car, nom_car: usuario.carrera.nom_car }
        : undefined,
      cuentas: usuario.cuentas,
    };
  }

  async findByEmail(email: string): Promise<UserData | null> {
    const cuenta = await this.prisma.cuenta.findFirst({
      where: { cor_cue: email },
      include: {
        usuario: {
          include: {
            carrera: true,
          },
        },
      },
    });

    if (!cuenta || !cuenta.usuario) return null;
    return this.mapToUserData(cuenta.usuario);
  }

  async findAll(): Promise<UserData[]> {
    const usuarios = await this.prisma.usuario.findMany({
      include: {
        carrera: true,
        cuentas: true,
      },
    });

    return usuarios.map((usuario) => this.mapToUserData(usuario));
  }

  async findByRole(role: string): Promise<UserData[]> {
    const cuentas = await this.prisma.cuenta.findMany({
      where: { rol_cue: role as any },
      include: {
        usuario: {
          include: {
            carrera: true
          }
        }
      }
    });

    return cuentas
      .filter((cuenta: any) => cuenta.usuario)
      .map((cuenta: any) => this.mapToUserData(cuenta.usuario!));
  }

  async update(id: string, userData: Partial<UserData>): Promise<UserData> {
    const usuario = await this.prisma.usuario.update({
      where: { id_usu: id },
      data: {
        nom_usu1: userData.firstName,
        nom_usu2: userData.secondName,
        ape_usu1: userData.lastName,
        ape_usu2: userData.secondLastName,
        fec_nac_usu: userData.dateOfBirth,
        num_tel_usu: userData.phoneNumber,
        pas_usu: userData.password,
        id_car_per: userData.careerId,
        github_token: userData.githubToken,
        github_username: userData.githubUsername,
      },
      include: {
        carrera: true,
        cuentas: true,
      },
    });

    return this.mapToUserData(usuario);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.usuario.delete({
      where: { id_usu: id },
    });
  }

  private mapToUserData(usuario: any): UserData {
    return {
      id: usuario.id_usu,
      cedula: usuario.ced_usu,
      firstName: usuario.nom_usu1,
      secondName: usuario.nom_usu2 || undefined,
      lastName: usuario.ape_usu1,
      secondLastName: usuario.ape_usu2 || undefined,
      dateOfBirth: usuario.fec_nac_usu,
      phoneNumber: usuario.num_tel_usu || undefined,
      password: usuario.pas_usu || undefined,
      careerId: usuario.id_car_per || undefined,
      githubToken: usuario.github_token || undefined,
      githubUsername: usuario.github_username || undefined,
    };
  }
}
