from tabulate import tabulate
import textwrap

def generate_report(detections, role="doctor"):

    if role == "doctor":

        print("\n========== AI Dental Analysis Report ==========\n")
        print("⚠ AI results must be verified by a dentist.\n")

        table_data = []

        for d in detections:
            wrapped_text = "\n".join(textwrap.wrap(d['treatment'], width=40))

            table_data.append([
                d['tooth'],
                d['disease'],
                d['severity'],
                f"{d['confidence']}%",
                wrapped_text
            ])

        headers = ["Tooth No.", "Disease", "Severity", "Confidence (%)", "AI Suggestion"]

        print(tabulate(
            table_data,
            headers=headers,
            tablefmt="grid",
            colalign=("center", "center", "center", "center", "left")
        ))

    else:

        print("\n====== Dental Screening Result ======\n")

        table_data = []

        for d in detections:
            msg = f"Possible {d['disease']} near Tooth #{d['tooth']}"
            wrapped_msg = "\n".join(textwrap.wrap(msg, width=50))
            table_data.append([wrapped_msg])

        headers = ["Screening Findings"]

        print(tabulate(
            table_data,
            headers=headers,
            tablefmt="grid",
            colalign=("left",)
        ))

        print("\nPlease consult a dentist for proper diagnosis.")