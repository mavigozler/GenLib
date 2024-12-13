/* eslint-disable @typescript-eslint/no-unused-vars */
"use strict";

const
	ATOMIC_MASS_CONSTANT_kg            =  1.66053886e-27,  // symbol mu
	AVOGADRO_CONSTANT_per_mol          =  6.0221415e23,    // symbol NA
	BOLTZMANN_CONSTANT_J_per_K         =  1.3806505e-23,   // symbol k
	CONDUCTANCE_QUANTUM_siemen         =  7.748091733e-5,  // symbol G0
	PERMITTIVITY_F_per_m               =  8.854187817e-12, // symbol epsilon sub 0
	ELECTRON_MASS_kg                   =  9.1093826e-31,   // symbol m_sub_e
	ELEMENTARY_CHARGE_C                =  1.60217653e-19,  // symbol
	FARADAY_CONSTANT_C_per_mol         =  96485.3383,      // symbol F
	FINE_STRUCTURE_CONSTANT            =  7.297352568e-3,
	INVERSE_FINE_STRUCTURE_CONSTANT    =  137.03599911,
	MAGNETIC_CONSTANT_N_per_Asquared   =  12.566370614e7,
	MAGNETIC_FLUX_QUANTUM_weber        =  2.06783372e-15,
	MOLAR_GAS_CONSTANT_J_per_K_mol     =  8.314472,         // symbol R
	NEWTONIAN_GRAVITATION_CONSTANT_m3_per_kg_sec = 6.6742e-11,
	PLANCK_CONSTANT_J_per_sec          =  6.6260693e-34,    // symbol h
	PROTON_MASS_kg                     =  1.67262171e-27,   // symbol msubp
	PROTON_ELECTRON_MASS_RATIO         = 1836.15267261, // Proton/electron mass ratio mp / me
	RYDBERG_CONSTANT_per_m             =  10973731.568525,
	LIGHT_SPEED_VACUUM_m_per_sec       =  299792458.0,
	STEFAN_BOLTZMANN_CONSTANT_W_per_m2 =  5.670400e-8;     // symbol small delta

const UniversalConstants = [
	{ name: "Atomic mass", unit: "kg", symbol: "&mu;", value: ATOMIC_MASS_CONSTANT_kg },
	{ name: "Avogadro's Number", unit: "per mol",
			symbol: "N<sub>A</sub>", value: AVOGADRO_CONSTANT_per_mol },
	{ name: "Boltzmann's number", unit: "J/K", symbol: "<i>k</i>",
			value: BOLTZMANN_CONSTANT_J_per_K },
	{ name: "Quantum Conductance", unit: "S", symbol: "G0",
			value: CONDUCTANCE_QUANTUM_siemen },
	{ name: "Permittivity", unit: "F/m", symbol: "&epsilon;<sub>0</sub>",
			value: PERMITTIVITY_F_per_m },
	{ name: "Electron mass", unit: "kg", symbol: "<i>m</i><sub>e</sub>",
			value: ELECTRON_MASS_kg },
	{ name: "Elementary Charge", unit: "C", value: ELEMENTARY_CHARGE_C },
	{ name: "Faraday Constant", unit: "C/mol", symbol: "<i>F</i>",
			value: FARADAY_CONSTANT_C_per_mol }
];

