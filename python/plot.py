import matplotlib.pyplot as plt
import pandas as pd
import sys
from targethours import find_total
import files as fs

arguments = sys.argv[1:]

save = False
show = False
debug = False

for arg in arguments:
    if arg == 'save':
        save = True
    elif arg == 'show':
        show = True
    elif arg == 'debug':
        debug = True

files = fs.get_sheets(arguments[0])

dfs = []

for file in files:

    df = pd.read_excel(
        file,
        engine="openpyxl"
    )
    
    date = file.split('_')[2].split('.')[0]

    df = df[df["Last Name"].notna()]
    df["Date"] = date
    df["Total Hours"] = pd.to_numeric(df["Total Hours"], errors="coerce")
    df["Live Hours"] = pd.to_numeric(df["Live Hours"], errors="coerce")
    df["E-Texting Hours"] = pd.to_numeric(df["E-Texting Hours"], errors="coerce")
    df["Scribing Hours"] = pd.to_numeric(df["Scribing Hours"], errors="coerce")
    df["Attendance"] = pd.to_numeric(df["Attendance"], errors="coerce")
    df["Excused Absences"] = pd.to_numeric(df["Excused Absences"], errors="coerce")
    
    df["Date"] = pd.to_datetime(df["Date"], format="%m-%d-%Y")

    
    dfs.append(df)
    
# Example: dfs is a list of DataFrames, each with a column "Email Address" (or any user identifier)
user_sets = [set(df["Email Address"]) for df in dfs]

# Find users present in ALL DataFrames (set intersection)
common_users = set.intersection(*user_sets)

# Now filter each DataFrame to include only those users
filtered_dfs = [df[df["Email Address"].isin(common_users)] for df in dfs]

# Concatenate and sort
combined_df = pd.concat(filtered_dfs, ignore_index=True)
combined_df.sort_values(["Last Name", "Date"], inplace=True)
 
   
dates = [str(date).split(' ')[0] for date in combined_df["Date"].dropna().unique()]

totals = [find_total(date) for date in dates]

if debug:
    #print(f'Used the following {len(totals)} reports for plot:')
    zipped = zip(files, totals)
    for tup in zipped:
        file_name = f'TG_Report_{tup[0].split('_')[-1]}'
        print(f'{file_name} -> {tup[1]} Total Hours')

# Ensure Date is datetime
combined_df["Date"] = pd.to_datetime(combined_df["Date"])

# Top 10 members by total hours
top_members = combined_df.groupby("Email Address")["Total Hours"].sum().nlargest(10).index

# All unique dates in order
all_dates = pd.to_datetime(sorted(combined_df["Date"].unique()))

plt.figure(figsize=(10, 7))
plt.style.use('seaborn-v0_8-darkgrid')

# Get color cycle for top members
colors = plt.rcParams['axes.prop_cycle'].by_key()['color']

for i, (email, group) in enumerate(combined_df.groupby("Email Address")):
    group = group.set_index("Date").reindex(all_dates, fill_value=0)

    first_name = group["First Name"].iloc[0]
    last_name = group["Last Name"].iloc[0]
    display_name = f"{first_name} {last_name}"

    if email in top_members:
        color = colors[list(top_members).index(email) % len(colors)]
        linestyle = "-"
        label = display_name
        linewidth = 1
        markersize = 6
        alpha = 0.9
    else:
        color = "gray"
        linestyle = "--"
        linewidth = 0.4
        markersize = 2
        label = None
        alpha = 0.4

    plt.plot(
        group.index,
        group["Total Hours"],
        marker="o",
        markersize=markersize,
        linewidth=linewidth,
        linestyle=linestyle,
        color=color,
        label=label,
        alpha=alpha,
    )

plt.title(f"Total Hours as of {all_dates[-1].strftime("%b %d")}")
plt.xlabel("Day")
plt.ylabel("Total Hours")
plt.xticks(all_dates, [d.strftime("%b %d") for d in all_dates], rotation=45)

avg_per_date = (
    combined_df.groupby("Date")["Total Hours"]
    .mean()
    .reindex(all_dates, fill_value=0)
)

# total On Track Hours
plt.plot(
    avg_per_date.index,
    totals,
    color="black",
    linestyle="-.",
    linewidth=4,
    alpha=0.8,
    marker="o",
    markersize=8,
    label="On Track Hours",
)


# Group Average
plt.plot(
    avg_per_date.index,
    avg_per_date.values,
    color="#18453B",
    linestyle=":",
    linewidth=5,
    markersize=8,
    alpha=1,
    marker="o",
    label="Daily Average",
)

# Legend inside top-left
plt.legend(loc="upper left", fontsize="small", title="Top Members", frameon=True, framealpha=0.9)

plt.grid(True, linestyle="--", alpha=0.4)
plt.tight_layout()
if save:
    plt.savefig(rf"{arguments[1]}", dpi=300, bbox_inches='tight')
if show:
    plt.show()
