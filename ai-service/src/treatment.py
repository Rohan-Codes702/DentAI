treatment_map = {

"Caries": "Possible treatment: Dental filling may be required",

"Crown": "Possible treatment: Crown adjustment may be needed",

"Filling": "Possible treatment: Filling condition should be checked",

"Implant": "Possible treatment: Implant monitoring recommended",

"Malaligned": "Possible treatment: Orthodontic treatment may be required",

"Mandibular Canal": "Requires specialist evaluation",

"Missing teeth": "Possible treatment: Dental implant or bridge may be required",

"Periapical lesion": "Possible treatment: Root canal therapy may be required",

"Retained root": "Possible treatment: Surgical extraction may be needed",

"Root Canal Filling": "Possible treatment: Root canal evaluation recommended"

}


def suggest_treatment(disease):

    return treatment_map.get(disease, "Consult dentist for evaluation")